import {
  Component,
  computed,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
} from '@angular/core';

import { Answer } from '../../models/survey';
import { toAnswerLetter } from '../../utils/survey-utils';

/**
 * Input type of one answer: checkbox for multiple choice, radio for single choice.
 */
type AnswerInputType = 'checkbox' | 'radio';

/**
 * One answer with its letter and a square checkbox or radio button.
 * Holds no state: the question passes the checked state in and gets every change reported.
 */
@Component({
  imports: [],
  selector: 'app-answer-option',
  styleUrl: './answer-option.scss',
  templateUrl: './answer-option.html',
})
export class AnswerOption {
  /**
   * Answer that is shown.
   */
  readonly answer: InputSignal<Answer> = input.required<Answer>();

  /**
   * Shared name of all radio buttons of one question, so only one can be checked.
   */
  readonly groupName: InputSignal<string> = input.required<string>();

  /**
   * True shows a checkbox, false a radio button.
   */
  readonly allowMultiple: InputSignal<boolean> = input.required<boolean>();

  /**
   * Checked state owned by survey-form.
   */
  readonly isChecked: InputSignal<boolean> = input.required<boolean>();

  /**
   * Reports the new checked state after every click or key press.
   */
  readonly toggled: OutputEmitterRef<boolean> = output<boolean>();

  /**
   * Type attribute of the input element.
   */
  protected readonly inputType: Signal<AnswerInputType> = computed(
    (): AnswerInputType => (this.allowMultiple() ? 'checkbox' : 'radio'),
  );

  /**
   * Letter A to F taken from the answer position.
   */
  protected readonly letter: Signal<string> = computed((): string =>
    toAnswerLetter(this.answer().position),
  );
}
