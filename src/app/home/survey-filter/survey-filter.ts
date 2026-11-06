import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';

import { CATEGORIES } from '../../constants/survey-constants';
import { DropdownOption } from '../../models/dropdown-option';
import { Category, SurveyTab } from '../../models/survey';
import { Dropdown } from '../../shared/dropdown/dropdown';

/**
 * Tabs for running and finished surveys plus the category dropdown.
 * Holds no state: shows what survey-list passes in and reports every change back.
 */
@Component({
  imports: [Dropdown],
  selector: 'app-survey-filter',
  styleUrl: './survey-filter.scss',
  templateUrl: './survey-filter.html',
})
export class SurveyFilter {
  /**
   * Tab chosen in survey-list.
   */
  readonly activeTab: InputSignal<SurveyTab> = input.required<SurveyTab>();

  /**
   * Category chosen in survey-list; null stands for "All Surveys".
   */
  readonly selectedCategory: InputSignal<Category | null> = input.required<Category | null>();

  /**
   * Reports the clicked tab.
   */
  readonly tabChanged: OutputEmitterRef<SurveyTab> = output<SurveyTab>();

  /**
   * Reports the category chosen in the dropdown.
   */
  readonly categoryChanged: OutputEmitterRef<Category | null> = output<Category | null>();

  /**
   * "All Surveys" first, then every category. Never changes, so no signal.
   */
  protected readonly categoryOptions: DropdownOption[] = [
    { value: null, label: 'All Surveys' },
    ...CATEGORIES.map(
      (category: Category): DropdownOption => ({ value: category, label: category }),
    ),
  ];
}
