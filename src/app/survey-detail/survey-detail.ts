import {
  Component,
  computed,
  effect,
  EffectCleanupRegisterFn,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { Answer, Question, SurveyDetail as SurveyDetailData, VoteCounts } from '../models/survey';
import { SurveyService } from '../services/survey.service';
import { Header } from '../shared/header/header';
import { isSurveyActive } from '../utils/survey-utils';
import { hasVotedFor } from '../utils/voted-surveys';
import { SurveyForm } from './survey-form/survey-form';
import { SurveyResults } from './survey-results/survey-results';

/**
 * State of one effect run, i.e. of one id.
 * isCancelled turns true when the id changes or the page is left.
 * unsubscribe is set as soon as the realtime subscription exists.
 */
interface VoteSubscription {
  isCancelled: boolean;
  unsubscribe: (() => void) | null;
}

/**
 * Detail page of one survey: voting form on the left, results on the right.
 * Owns the loaded survey, the vote counts and the voted state and hands them to its children.
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
   * onCleanup runs before the next id and when the page is left, and ends this run.
   */
  constructor() {
    effect((onCleanup: EffectCleanupRegisterFn): void => {
      const id: string = this.id();
      const subscription: VoteSubscription = { isCancelled: false, unsubscribe: null };
      untracked((): Promise<void> => this.fetchSurvey(id, subscription));
      onCleanup((): void => this.endSubscription(subscription));
    });
  }

  /**
   * Loads the survey for the given id and reads the voted state for it.
   * A response that arrives after this run was cancelled is dropped, so a slow request
   * cannot overwrite the current survey and cannot start a subscription nobody ends.
   */
  private async fetchSurvey(id: string, subscription: VoteSubscription): Promise<void> {
    this.isLoading.set(true);
    this.voteCounts.set({});
    const survey: SurveyDetailData | null = await this.loadSurveyOrNull(id);
    const isOutdated: boolean = subscription.isCancelled || id !== this.id();
    if (isOutdated) {
      return;
    }
    this.survey.set(survey);
    this.hasVoted.set(survey !== null && hasVotedFor(id));
    this.isLoading.set(false);
    if (survey !== null) {
      this.followVoteCounts(survey, subscription);
    }
  }

  /**
   * Loads the vote counts once and keeps them up to date for running surveys.
   * The subscription reloads the counts as soon as it is active and after every new vote.
   * Ended surveys cannot get new votes, so they get no subscription.
   */
  private followVoteCounts(survey: SurveyDetailData, subscription: VoteSubscription): void {
    this.fetchVoteCounts(survey.id);
    if (!this.isActive()) {
      return;
    }
    subscription.unsubscribe = this.surveyService.subscribeToVotes(
      this.answerIdsOf(survey),
      survey.id,
      (): void => this.onVotesChanged(survey.id, subscription),
    );
  }

  /**
   * Reloads the counts after a realtime change, unless this run was cancelled meanwhile.
   * A late event of the old survey would otherwise raise latestVoteCountsRequest
   * and make the first count request of the new survey look outdated.
   */
  private onVotesChanged(surveyId: string, subscription: VoteSubscription): void {
    if (!subscription.isCancelled) {
      this.fetchVoteCounts(surveyId);
    }
  }

  /**
   * All answer ids of the survey; the realtime filter only reports votes on these.
   */
  private answerIdsOf(survey: SurveyDetailData): string[] {
    return survey.questions.flatMap((question: Question): string[] =>
      question.answers.map((answer: Answer): string => answer.id),
    );
  }

  /**
   * Cancels the run of the old id: a survey that is still loading no longer subscribes,
   * and an existing subscription is ended.
   */
  private endSubscription(subscription: VoteSubscription): void {
    subscription.isCancelled = true;
    subscription.unsubscribe?.();
  }

  /**
   * Called by survey-form after the own votes are saved:
   * locks the form and reloads the counts right away. Realtime reports the same votes
   * a moment later; the counter in fetchVoteCounts keeps only the newest response.
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
