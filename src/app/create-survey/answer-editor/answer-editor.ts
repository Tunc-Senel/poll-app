import {
  Component,
  computed,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { hasVisibleError } from '../../utils/form-errors';
import { toAnswerLetter } from '../../utils/survey-utils';

/**
 * One answer field of a question: letter, text field and delete icon.
 * question-editor decides what the delete icon does, this component only reports the click.
 */
@Component({
  host: { class: 'form-field' },
  imports: [ReactiveFormsModule],
  selector: 'app-answer-editor',
  styleUrl: './answer-editor.scss',
  templateUrl: './answer-editor.html',
})
export class AnswerEditor {
  /**
   * Form control of this answer, part of the answers FormArray of the question.
   */
  readonly control: InputSignal<FormControl<string>> = input.required<FormControl<string>>();

  /**
   * Number of the question, only used for unique ids.
   */
  readonly questionNumber: InputSignal<number> = input.required<number>();

  /**
   * Position in the question, starting at 1; gives the letter A–F.
   */
  readonly position: InputSignal<number> = input.required<number>();

  /**
   * True while the question has more than MIN_ANSWERS answers: the icon removes the field.
   * Otherwise it only empties the field.
   */
  readonly isRemovable: InputSignal<boolean> = input.required<boolean>();

  /**
   * True after the first click on "Publish": shows the error of an untouched field as well.
   */
  readonly showAllErrors: InputSignal<boolean> = input.required<boolean>();

  /**
   * Reports a click on the delete icon.
   */
  readonly deleteClicked: OutputEmitterRef<void> = output<void>();

  /**
   * Letter shown before the field, recalculated after an answer above is removed.
   */
  protected readonly letter: Signal<string> = computed((): string =>
    toAnswerLetter(this.position()),
  );

  /**
   * Unique id of the field for the label, also the start of the error id.
   */
  protected readonly fieldId: Signal<string> = computed(
    (): string => `question-${this.questionNumber()}-answer-${this.position()}`,
  );

  /**
   * Id of the error message, referenced by aria-describedby.
   */
  protected readonly errorId: Signal<string> = computed((): string => `${this.fieldId()}-error`);

  /**
   * Accessible name of the delete icon, it tells whether the field is removed or emptied.
   */
  protected readonly deleteLabel: Signal<string> = computed((): string =>
    this.isRemovable() ? `Remove answer ${this.letter()}` : `Clear answer ${this.letter()}`,
  );

  /**
   * True when the answer is invalid and either touched or after a click on "Publish".
   */
  protected showsError(): boolean {
    return hasVisibleError(this.control(), this.showAllErrors());
  }
}
