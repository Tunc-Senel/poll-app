import {
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { SurveyDetail as SurveyDetailData, VoteCounts } from '../models/survey';
import { SurveyService } from '../services/survey.service';
import { Header } from '../shared/header/header';
import { isSurveyActive } from '../utils/survey-utils';
import { hasVotedFor } from '../utils/voted-surveys';
import { SurveyForm } from './survey-form/survey-form';
import { SurveyResults } from './survey-results/survey-results';

/**
 * Detail page of one survey: voting form on the left, results on the right.
 * Owns the loaded survey and the voted state and hands both to its children.
 * The router reuses this component when only the id changes, so loading follows the id.
 */
@Component({
  imports: [Header, RouterLink, SurveyForm, SurveyResults],
  selector: 'app-survey-detail',
  styleUrl: './survey-detail.scss',
  templateUrl: './survey-detail.html',
})
export class SurveyDetail {
  private readonly surveyService: SurveyService = inject(SurveyService);

  /**
   * Route parameter, bound by withComponentInputBinding().
   */
  readonly id: InputSignal<string> = input.required<string>();

  /**
   * Survey with questions and answers; null when the id is unknown.
   */
  protected readonly survey: WritableSignal<SurveyDetailData | null> =
    signal<SurveyDetailData | null>(null);

  /**
   * True while the survey for the current id is loading.
   */
  protected readonly isLoading: WritableSignal<boolean> = signal<boolean>(true);

  /**
   * True when this browser has already voted in the loaded survey.
   */
  protected readonly hasVoted: WritableSignal<boolean> = signal<boolean>(false);

  /**
   * Votes per answer id of the loaded survey, handed to survey-results.
   */
  protected readonly voteCounts: WritableSignal<VoteCounts> = signal<VoteCounts>({});

  /**
   * False for ended surveys. Calculated only here:
   * survey-form locks its questions with it, survey-results hides the LIVE badge.
   */
  protected readonly isActive: Signal<boolean> = computed((): boolean => {
    const survey: SurveyDetailData | null = this.survey();
    return survey !== null && isSurveyActive(survey, new Date());
  });

  /**
   * Number of the most recent vote count request.
   * Only the response to this request may set the counts, so an older response
   * that arrives late cannot overwrite a newer one.
   */
  private latestVoteCountsRequest: number = 0;

  /**
   * Reloads the page content whenever the id changes.
   * Only the id is tracked. fetchSurvey runs untracked, so signals it reads
   * synchronously before its first await do not become dependencies of the effect.
   */
  constructor() {
    effect((): void => {
      const id: string = this.id();
      untracked((): Promise<void> => this.fetchSurvey(id));
    });
  }

  /**
   * Loads the survey for the given id and reads the voted state for it.
   * A response that arrives after the id has changed again is dropped,
   * so a slow request for an old survey cannot overwrite the current one.
   */
  private async fetchSurvey(id: string): Promise<void> {
    this.isLoading.set(true);
    this.voteCounts.set({});
    const survey: SurveyDetailData | null = await this.loadSurveyOrNull(id);
    const isOutdated: boolean = id !== this.id();
    if (isOutdated) {
      return;
    }
    this.survey.set(survey);
    this.hasVoted.set(survey !== null && hasVotedFor(id));
    this.isLoading.set(false);
    if (survey !== null) {
      this.fetchVoteCounts(id);
    }
  }

  /**
   * Called by survey-form after the own votes are saved:
   * locks the form and reloads the counts, so the results include the new votes.
   */
  protected onVoted(): void {
    this.hasVoted.set(true);
    this.fetchVoteCounts(this.id());
  }

  /**
   * Loads the vote counts for the given id.
   * Drops the response when a newer request was started or the id has changed meanwhile.
   * When loading fails, the last known counts stay visible.
   */
  private async fetchVoteCounts(id: string): Promise<void> {
    this.latestVoteCountsRequest++;
    const request: number = this.latestVoteCountsRequest;
    const voteCounts: VoteCounts | null = await this.loadVoteCountsOrNull(id);
    const isOutdated: boolean = request !== this.latestVoteCountsRequest || id !== this.id();
    if (isOutdated || voteCounts === null) {
      return;
    }
    this.voteCounts.set(voteCounts);
  }

  /**
   * Treats a failed request like an unknown id.
   * An id that is not a UUID makes Supabase answer with an error instead of null.
   */
  private async loadSurveyOrNull(id: string): Promise<SurveyDetailData | null> {
    try {
      return await this.surveyService.loadSurveyDetail(id);
    } catch {
      return null;
    }
  }

  /**
   * Returns null instead of throwing, so a failed reload does not break the page.
   */
  private async loadVoteCountsOrNull(id: string): Promise<VoteCounts | null> {
    try {
      return await this.surveyService.loadVoteCounts(id);
    } catch {
      return null;
    }
  }
}
