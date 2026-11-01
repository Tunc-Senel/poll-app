import { Component, input, InputSignal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-survey-detail',
  styleUrl: './survey-detail.scss',
  templateUrl: './survey-detail.html',
})
export class SurveyDetail {
  /**
   * Survey id from the route parameter :id, set by the router.
   */
  readonly id: InputSignal<string> = input.required<string>();
}
