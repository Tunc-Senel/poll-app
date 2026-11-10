/**
 * Sports offered in the category filter and the create form.
 * Spelling must match surveys.category in Supabase.
 */
export const CATEGORIES = [
  'Basketball',
  'Football',
  'Padel',
  'Tennis'
] as const;

/**
 * Time window in calendar days for the "Ending soon" section on Home.
 */
export const ENDING_SOON_DAYS: number = 3;

/**
 * Number of cards the "Ending soon" section shows at most.
 */
export const ENDING_SOON_MAX: number = 3;

/**
 * Lower limit of answer options per question in the create form.
 */
export const MIN_ANSWERS: number = 2;

/**
 * Upper limit of answer options per question in the create form.
 */
export const MAX_ANSWERS: number = 6;

/**
 * Milliseconds of one day, used to count calendar days.
 */
export const MS_PER_DAY: number = 24 * 60 * 60 * 1000;

/**
 * localStorage key for the ids of all surveys this browser has voted in.
 */
export const VOTED_SURVEYS_KEY: string = 'pollApp.votedSurveys';

/**
 * Only date format of the app, used by the deadline pipe and survey-info.
 */
export const DATE_FORMAT: string = 'dd.MM.yyyy';
