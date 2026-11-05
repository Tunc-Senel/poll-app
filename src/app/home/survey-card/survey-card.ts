import { Component, input, InputSignal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Survey } from '../../models/survey';
import { DeadlinePipe } from '../../pipes/deadline-pipe';

/**
 * Card in "Ending soon surveys" with category, title and deadline.
 * The whole card links to the detail page.
 */
@Component({
  imports: [RouterLink, DeadlinePipe],
  selector: 'app-survey-card',
  styleUrl: './survey-card.scss',
  templateUrl: './survey-card.html',
})
export class SurveyCard {
  /**
   * Survey shown on this card.
   */
  readonly survey: InputSignal<Survey> = input.required<Survey>();
}
