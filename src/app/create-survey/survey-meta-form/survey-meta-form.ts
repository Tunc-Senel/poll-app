import { Component, input, InputSignal } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';

import { CATEGORIES } from '../../constants/survey-constants';
import { DropdownOption } from '../../models/dropdown-option';
import { Category } from '../../models/survey';
import { SurveyMetaGroup } from '../../models/survey-form-controls';
import { Dropdown } from '../../shared/dropdown/dropdown';
import { toDateInputValue } from '../../utils/date-input';
import { hasVisibleError } from '../../utils/form-errors';

/**
 * Meta fields of a new survey: name, category, end date and description.
 * The form group belongs to create-survey; this component only shows and edits it.
 */
@Component({
  imports: [Dropdown, ReactiveFormsModule],
  selector: 'app-survey-meta-form',
  styleUrl: './survey-meta-form.scss',
  templateUrl: './survey-meta-form.html',
})
export class SurveyMetaForm {
  /**
   * Meta form group created by create-survey.
   */
  readonly form: InputSignal<SurveyMetaGroup> = input.required<SurveyMetaGroup>();

  /**
   * True after the first click on "Publish": shows the errors of untouched fields as well.
   * A signal input, so this OnPush component redraws when the parent changes it.
   */
  readonly showAllErrors: InputSignal<boolean> = input.required<boolean>();

  /**
   * Every category as an option; the form has no "All Surveys" entry.
   */
  protected readonly categoryOptions: DropdownOption[] = CATEGORIES.map(
    (category: Category): DropdownOption => ({ value: category, label: category }),
  );

  /**
   * Earliest date the date picker offers. notInPastValidator checks it again on every change.
   */
  protected readonly minDate: string = toDateInputValue(new Date());

  /**
   * True when a field is invalid and either touched or after a click on "Publish".
   */
  protected showsError(control: AbstractControl): boolean {
    return hasVisibleError(control, this.showAllErrors());
  }

  /**
   * Puts the category chosen in the dropdown into the form.
   */
  protected selectCategory(category: Category | null): void {
    this.form().controls.category.setValue(category);
  }

  /**
   * Marks the category as touched once the dropdown closes, with or without a choice.
   * The dropdown does not know the form control, so this happens here.
   */
  protected markCategoryTouched(): void {
    this.form().controls.category.markAsTouched();
  }

  /**
   * Empties a text field via its delete icon.
   */
  protected clear(control: FormControl<string>): void {
    control.setValue('');
  }
}
