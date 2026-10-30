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
