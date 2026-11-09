import { Component, input, InputSignal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Survey } from '../../models/survey';
import { DeadlinePipe } from '../../pipes/deadline-pipe';

/**
 * Entry in the survey list with category, title and deadline.
 * The whole entry links to the detail page, also for finished surveys.
 */
@Component({
  imports: [RouterLink, DeadlinePipe],
  selector: 'app-survey-list-item',
  styleUrl: './survey-list-item.scss',
  templateUrl: './survey-list-item.html',
})
export class SurveyListItem {
  /**
   * Survey shown in this entry.
   */
  readonly survey: InputSignal<Survey> = input.required<Survey>();
}
