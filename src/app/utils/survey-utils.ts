import { Survey } from '../models/survey';

/**
 * Active means the survey has no end date or ends after the given moment.
 * The moment is passed in so every call in one calculation uses the same time.
 */
export function isSurveyActive(survey: Survey, now: Date): boolean {
  return survey.endDate === null || survey.endDate > now;
}

/**
 * Compare function for sort(): earliest end first, surveys without end date last.
 */
export function byEarliestEnd(a: Survey, b: Survey): number {
  if (a.endDate === null && b.endDate === null) {
    return 0;
  }
  if (a.endDate === null) {
    return 1;
  }
  if (b.endDate === null) {
    return -1;
  }
  return a.endDate.getTime() - b.endDate.getTime();
}

/**
 * Compare function for sort(): latest end first.
 * Past surveys always have an end date, the null check only satisfies the type.
 */
export function byLatestEnd(a: Survey, b: Survey): number {
  if (a.endDate === null || b.endDate === null) {
    return 0;
  }
  return b.endDate.getTime() - a.endDate.getTime();
}
