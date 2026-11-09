import {
  Component,
  effect,
  inject,
  input,
  InputSignal,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { SurveyDetail as SurveyDetailData } from '../models/survey';
import { SurveyService } from '../services/survey.service';
import { Header } from '../shared/header/header';
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
    const survey: SurveyDetailData | null = await this.loadSurveyOrNull(id);
    const isOutdated: boolean = id !== this.id();
    if (isOutdated) {
      return;
    }
    this.survey.set(survey);
    this.hasVoted.set(survey !== null && hasVotedFor(id));
    this.isLoading.set(false);
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
}
