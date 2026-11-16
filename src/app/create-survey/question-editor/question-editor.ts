import {
  Component,
  computed,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
} from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';

import { MAX_ANSWERS, MIN_ANSWERS } from '../../constants/survey-constants';
import { AnswerArray, QuestionGroup } from '../../models/survey-form-controls';
import { hasVisibleError } from '../../utils/form-errors';
import { createRequiredTextControl } from '../../utils/survey-form-factory';
import { AnswerEditor } from '../answer-editor/answer-editor';

/**
 * One question of a new survey: question text, answers and "Allow multiple answers".
 * The question group belongs to create-survey; this component edits it and its answers.
 */
@Component({
  imports: [AnswerEditor, ReactiveFormsModule],
  selector: 'app-question-editor',
  styleUrl: './question-editor.scss',
  templateUrl: './question-editor.html',
})
export class QuestionEditor {
  /**
   * Form group of this question, part of the questions FormArray in create-survey.
   */
  readonly group: InputSignal<QuestionGroup> = input.required<QuestionGroup>();

  /**
   * Number shown before "Question", starting at 1.
   */
  readonly number: InputSignal<number> = input.required<number>();

  /**
   * True after the first click on "Publish": shows the errors of untouched fields as well.
   */
  readonly showAllErrors: InputSignal<boolean> = input.required<boolean>();

  /**
   * Asks create-survey to remove this question. Never sent by question 1.
   */
  readonly removed: OutputEmitterRef<void> = output<void>();

  /**
   * Upper limit for the template ("Add answer" and the hint).
   */
  protected readonly maxAnswers: number = MAX_ANSWERS;

  /**
   * Question 1 can never be removed, its delete icon only empties the fields.
   */
  protected readonly isFirst: Signal<boolean> = computed((): boolean => this.number() === 1);

  /**
   * Unique id of the question field, also the start of the other ids.
   */
  protected readonly fieldId: Signal<string> = computed((): string => `question-${this.number()}`);

  /**
   * Id of the error message of the question field, referenced by aria-describedby.
   */
  protected readonly errorId: Signal<string> = computed((): string => `${this.fieldId()}-error`);

  /**
   * Id of the "Answers" label, referenced by aria-labelledby of the answer list.
   */
  protected readonly answersLabelId: Signal<string> = computed(
    (): string => `${this.fieldId()}-answers`,
  );

  /**
   * Accessible name of the delete icon, it tells whether the question is removed or emptied.
   */
  protected readonly deleteLabel: Signal<string> = computed((): string =>
    this.isFirst() ? 'Clear question 1' : `Remove question ${this.number()}`,
  );

  /**
   * True when a field is invalid and either touched or after a click on "Publish".
   */
  protected showsError(control: AbstractControl): boolean {
    return hasVisibleError(control, this.showAllErrors());
  }

  /**
   * True while an answer can be removed without falling below MIN_ANSWERS.
   */
  protected canRemoveAnswer(): boolean {
    return this.answers().length > MIN_ANSWERS;
  }

  /**
   * Delete icon of the question: question 1 is only emptied, every other one is removed.
   */
  protected deleteQuestion(): void {
    if (this.isFirst()) {
      this.clearFields();
    } else {
      this.removed.emit();
    }
  }

  /**
   * Adds an empty answer field. The template hides the button at MAX_ANSWERS.
   */
  protected addAnswer(): void {
    this.answers().push(createRequiredTextControl());
  }

  /**
   * Delete icon of an answer: removes it above MIN_ANSWERS, otherwise only empties it.
   * The letters follow the new positions automatically.
   */
  protected deleteAnswer(index: number): void {
    if (this.canRemoveAnswer()) {
      this.answers().removeAt(index);
    } else {
      this.answers().at(index).setValue('');
    }
  }

  /**
   * Empties the question text and every answer, like the delete icons of the meta fields.
   * The number of answers and "Allow multiple answers" stay as they are.
   */
  private clearFields(): void {
    this.group().controls.text.setValue('');
    this.answers().controls.forEach((answer: FormControl<string>): void => answer.setValue(''));
  }

  /**
   * Shortcut to the answers FormArray of this question.
   */
  private answers(): AnswerArray {
    return this.group().controls.answers;
  }
}
