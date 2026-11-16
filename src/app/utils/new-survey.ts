import { NewQuestion, NewSurvey } from '../models/survey';
import {
  QuestionArray,
  QuestionControls,
  QuestionGroup,
  SurveyMetaControls,
  SurveyMetaGroup,
} from '../models/survey-form-controls';
import { toEndOfDay } from './date-input';

/**
 * Turns the valid create form into a NewSurvey: texts trimmed, an empty description
 * becomes null, the end date becomes the end of the chosen day.
 * Returns null without a category; a valid form always has one, the check only narrows the type.
 */
export function toNewSurvey(meta: SurveyMetaGroup, questions: QuestionArray): NewSurvey | null {
  const { title, category, endDate, description }: SurveyMetaControls = meta.controls;
  if (category.value === null) {
    return null;
  }
  return {
    title: title.value.trim(),
    description: description.value.trim() || null,
    category: category.value,
    endDate: toEndOfDay(endDate.value),
    questions: questions.controls.map((group: QuestionGroup): NewQuestion => toNewQuestion(group)),
  };
}

/**
 * Turns one question group into a NewQuestion with trimmed texts.
 */
function toNewQuestion(group: QuestionGroup): NewQuestion {
  const { text, allowMultiple, answers }: QuestionControls = group.controls;
  return {
    text: text.value.trim(),
    allowMultiple: allowMultiple.value,
    answers: answers.getRawValue().map((answer: string): string => answer.trim()),
  };
}
