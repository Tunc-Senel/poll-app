import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

import { MIN_ANSWERS, NOT_BLANK_PATTERN } from '../constants/survey-constants';
import {
  AnswerArray,
  QuestionArray,
  QuestionControls,
  QuestionGroup,
  SurveyMetaControls,
  SurveyMetaGroup,
} from '../models/survey-form-controls';
import { Category } from '../models/survey';
import { notInPastValidator } from './survey-validators';

/**
 * Builds an empty meta form: title and category required, end date not in the past.
 * A function instead of a field, so step 22.5 can build a fresh form after closing.
 */
export function createSurveyMetaGroup(): SurveyMetaGroup {
  return new FormGroup<SurveyMetaControls>({
    title: createRequiredTextControl(),
    category: new FormControl<Category | null>(null, Validators.required),
    endDate: new FormControl<string>('', { nonNullable: true, validators: notInPastValidator }),
    description: new FormControl<string>('', { nonNullable: true }),
  });
}

/**
 * Builds a required text field that must contain a visible character.
 * Used for the question text and for every answer.
 */
export function createRequiredTextControl(): FormControl<string> {
  return new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(NOT_BLANK_PATTERN)],
  });
}

/**
 * Builds a question with an empty text and MIN_ANSWERS empty answers.
 */
export function createQuestionGroup(): QuestionGroup {
  return new FormGroup<QuestionControls>({
    text: createRequiredTextControl(),
    answers: createAnswerArray(),
  });
}

/**
 * Builds the questions of a new survey: one empty question, so there is always at least one.
 */
export function createQuestionArray(): QuestionArray {
  return new FormArray<QuestionGroup>([createQuestionGroup()]);
}

/**
 * MIN_ANSWERS empty answer fields for a new question.
 */
function createAnswerArray(): AnswerArray {
  const answers: FormControl<string>[] = Array.from(
    { length: MIN_ANSWERS },
    (): FormControl<string> => createRequiredTextControl(),
  );
  return new FormArray<FormControl<string>>(answers);
}
