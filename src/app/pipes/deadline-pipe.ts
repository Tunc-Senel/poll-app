import { formatDate } from '@angular/common';
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

import { DATE_FORMAT } from '../constants/survey-constants';
import { daysUntil } from '../utils/survey-utils';

/**
 * Turns an end date into the deadline text shown on cards and list items.
 * The only place where these texts are built.
 */
@Pipe({
  name: 'deadline',
})
export class DeadlinePipe implements PipeTransform {
  private readonly locale: string = inject(LOCALE_ID);

  /**
   * Handles surveys without end date and finished surveys,
   * hands everything else to the text for running surveys.
   */
  transform(endDate: Date | null): string {
    if (endDate === null) {
      return 'No end date';
    }
    const days: number = daysUntil(endDate, new Date());
    if (days < 0) {
      return `Ended on ${formatDate(endDate, DATE_FORMAT, this.locale)}`;
    }
    return this.formatRemaining(days);
  }

  /**
   * Text for a running survey, with singular for one day.
   */
  private formatRemaining(days: number): string {
    if (days === 0) {
      return 'Ends today';
    }
    if (days === 1) {
      return 'Ends in 1 Day';
    }
    return `Ends in ${days} Days`;
  }
}
