import { CATEGORIES } from '../constants/survey-constants';

/**
 * One of the fixed sports from CATEGORIES.
 * Prevents typos like "Footbal" at compile time.
 */
export type Category = typeof CATEGORIES[number];

/**
 * Survey as listed on Home, without questions.
 * endDate is the end of the chosen day; null means it never ends.
 */
export interface Survey {
  id: string;
  title: string;
  category: Category;
  description: string | null;
  endDate: Date | null;
}

/**
 * Answer option of a question.
 * position starts at 1 and gives the letter A–F.
 */
export interface Answer {
  id: string;
  text: string;
  position: number;
}

/**
 * Question with its answer options.
 * allowMultiple switches between radio buttons and checkboxes.
 */
export interface Question {
  id: string;
  text: string;
  allowMultiple: boolean;
  position: number;
  answers: Answer[];
}

/**
 * Survey with all questions and answers, loaded for the detail page.
 */
export interface SurveyDetail extends Survey {
  questions: Question[];
}

/**
 * Votes per answer id.
 * Kept apart from the survey so live updates only replace this object.
 */
export type VoteCounts = Record<string, number>;
