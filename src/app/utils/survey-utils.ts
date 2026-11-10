import { MS_PER_DAY } from '../constants/survey-constants';
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

/**
 * Calendar days from now until the end date: 0 is today, 1 is tomorrow, negative is past.
 * Counts whole days, so the time of day does not matter.
 */
export function daysUntil(endDate: Date, now: Date): number {
  return (toDayStamp(endDate) - toDayStamp(now)) / MS_PER_DAY;
}

/**
 * Midnight of the local calendar day as a UTC timestamp.
 * UTC has no daylight saving time, so every day is exactly MS_PER_DAY long.
 */
function toDayStamp(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Letter shown before an answer: position 1 is A, 2 is B and so on.
 */
export function toAnswerLetter(position: number): string {
  return String.fromCharCode('A'.charCodeAt(0) + position - 1);
}
