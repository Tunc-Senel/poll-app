import { Component, computed, input, InputSignal, Signal } from '@angular/core';

import { ENDING_SOON_DAYS, ENDING_SOON_MAX } from '../../constants/survey-constants';
import { Survey } from '../../models/survey';
import { byEarliestEnd, daysUntil, isSurveyActive } from '../../utils/survey-utils';
import { SurveyCard } from '../survey-card/survey-card';

/**
 * Shows the running surveys that end within ENDING_SOON_DAYS as cards.
 * Hidden completely when there is none; the tab and category filter do not apply here.
 */
@Component({
  imports: [SurveyCard],
  selector: 'app-ending-soon-surveys',
  styleUrl: './ending-soon-surveys.scss',
  templateUrl: './ending-soon-surveys.html',
})
export class EndingSoonSurveys {
  /**
   * All surveys from survey-list, unfiltered.
   */
  readonly surveys: InputSignal<Survey[]> = input.required<Survey[]>();

  /**
   * Running surveys with an end date in the time window, earliest end first, at most ENDING_SOON_MAX.
   */
  protected readonly endingSoonSurveys: Signal<Survey[]> = computed((): Survey[] => {
    const now: Date = new Date();
    return this.surveys()
      .filter(
        (survey: Survey): boolean =>
          isSurveyActive(survey, now) &&
          survey.endDate !== null &&
          daysUntil(survey.endDate, now) <= ENDING_SOON_DAYS,
      )
      .sort(byEarliestEnd)
      .slice(0, ENDING_SOON_MAX);
  });
}
