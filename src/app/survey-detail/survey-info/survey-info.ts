import { DatePipe } from '@angular/common';
import { Component, input, InputSignal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DATE_FORMAT } from '../../constants/survey-constants';
import { Survey } from '../../models/survey';

/**
 * Head of the voting card: status badge, end date, category, title and description.
 * On mobile an X link back to Home replaces the create button of the header.
 */
@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-survey-info',
  styleUrl: './survey-info.scss',
  templateUrl: './survey-info.html',
})
export class SurveyInfo {
  /**
   * Survey whose details are shown.
   */
  readonly survey: InputSignal<Survey> = input.required<Survey>();

  /**
   * Decides between "Published" and "Ended" and between "Ends on" and "Ended on".
   */
  readonly isActive: InputSignal<boolean> = input.required<boolean>();

  /**
   * Shared date format, kept as a field because templates cannot read imported constants.
   */
  protected readonly dateFormat: string = DATE_FORMAT;
}
