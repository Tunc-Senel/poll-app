import { AbstractControl, ValidationErrors } from '@angular/forms';

import { toDateInputValue } from './date-input';

/**
 * Rejects an end date before today; today itself is allowed (the survey runs until 23:59:59).
 * Both values are "YYYY-MM-DD", so comparing them as text gives the right order.
 * An empty field is valid, the end date is optional.
 */
export function notInPastValidator(control: AbstractControl<string>): ValidationErrors | null {
  const value: string = control.value;
  if (value === '') {
    return null;
  }
  return value < toDateInputValue(new Date()) ? { pastDate: true } : null;
}
