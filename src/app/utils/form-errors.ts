import { AbstractControl } from '@angular/forms';

/**
 * True when a field is invalid and either touched or all errors are shown after "Publish".
 * Shared by survey-meta-form, question-editor and answer-editor.
 */
export function hasVisibleError(control: AbstractControl, showAllErrors: boolean): boolean {
  return control.invalid && (control.touched || showAllErrors);
}
