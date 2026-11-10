import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';

import { Question } from '../../models/survey';
import { AnswerOption } from '../answer-option/answer-option';

/**
 * One question with its answers as a fieldset.
 * Turns a single answer change into the new selection of the whole question.
 */
@Component({
  imports: [AnswerOption],
  selector: 'app-survey-question',
  styleUrl: './survey-question.scss',
  templateUrl: './survey-question.html',
})
export class SurveyQuestion {
  /**
   * Question with its answers, already sorted by position.
   */
  readonly question: InputSignal<Question> = input.required<Question>();

  /**
   * Ids of the answers currently chosen for this question.
   */
  readonly selectedIds: InputSignal<string[]> = input.required<string[]>();

  /**
   * Disables the fieldset and with it every input inside.
   */
  readonly isDisabled: InputSignal<boolean> = input.required<boolean>();

  /**
   * Reports the complete new selection of this question.
   */
  readonly selectionChanged: OutputEmitterRef<string[]> = output<string[]>();

  /**
   * Called by an answer option whenever its checked state changes.
   */
  protected toggleAnswer(answerId: string, isChecked: boolean): void {
    this.selectionChanged.emit(this.nextSelection(answerId, isChecked));
  }

  /**
   * Single choice keeps only the clicked answer.
   * Multiple choice adds or removes the clicked answer and keeps the others.
   */
  private nextSelection(answerId: string, isChecked: boolean): string[] {
    if (!this.question().allowMultiple) {
      return [answerId];
    }
    const otherIds: string[] = this.selectedIds().filter((id: string): boolean => id !== answerId);
    return isChecked ? [...otherIds, answerId] : otherIds;
  }
}
