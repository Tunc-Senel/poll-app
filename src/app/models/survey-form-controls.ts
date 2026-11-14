import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { Category } from './survey';

/**
 * Controls of the meta fields in the create survey form.
 * endDate holds the value of input type="date" ("YYYY-MM-DD"), empty means no end date.
 */
export interface SurveyMetaControls {
  title: FormControl<string>;
  category: FormControl<Category | null>;
  endDate: FormControl<string>;
  description: FormControl<string>;
}

/**
 * Typed form group of the meta fields, owned by create-survey.
 */
export type SurveyMetaGroup = FormGroup<SurveyMetaControls>;

/**
 * Answer fields of one question, between MIN_ANSWERS and MAX_ANSWERS.
 */
export type AnswerArray = FormArray<FormControl<string>>;

/**
 * Controls of one question in the create survey form.
 */
export interface QuestionControls {
  text: FormControl<string>;
  answers: AnswerArray;
}

/**
 * Typed form group of one question.
 */
export type QuestionGroup = FormGroup<QuestionControls>;

/**
 * All questions of the new survey, at least one, owned by create-survey.
 */
export type QuestionArray = FormArray<QuestionGroup>;
