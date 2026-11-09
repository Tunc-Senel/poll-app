import { Component, computed, input, InputSignal, Signal } from '@angular/core';

import { Survey, SurveyTab } from '../../models/survey';
import { SurveyListItem } from '../survey-list-item/survey-list-item';

/**
 * Grid of the filtered surveys, scrollable in its own area on desktop and tablet.
 * Shows a hint instead of an empty list when the filter has no results.
 */
@Component({
  imports: [SurveyListItem],
  selector: 'app-all-surveys',
  styleUrl: './all-surveys.scss',
  templateUrl: './all-surveys.html',
})
export class AllSurveys {
  /**
   * Surveys already filtered and sorted by survey-list.
   */
  readonly surveys: InputSignal<Survey[]> = input.required<Survey[]>();

  /**
   * Tab chosen in survey-list, names the list for screen readers.
   */
  readonly tab: InputSignal<SurveyTab> = input.required<SurveyTab>();

  /**
   * Heading that only screen readers announce.
   */
  protected readonly heading: Signal<string> = computed((): string =>
    this.tab() === 'active' ? 'Active surveys' : 'Past surveys',
  );
}
