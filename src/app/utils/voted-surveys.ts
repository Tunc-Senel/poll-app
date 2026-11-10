import { VOTED_SURVEYS_KEY } from '../constants/survey-constants';

/**
 * Ids of all surveys this browser has voted in.
 * Returns an empty list when nothing is stored or the stored value is unreadable.
 */
export function readVotedSurveyIds(): string[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(VOTED_SURVEYS_KEY) ?? '[]');
    return isStringArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

/**
 * True when this browser has already voted in the given survey.
 */
export function hasVotedFor(surveyId: string): boolean {
  return readVotedSurveyIds().includes(surveyId);
}

/**
 * Stores the survey id, so the form stays locked after a reload.
 * A full or blocked localStorage is ignored, because the vote itself is already saved.
 */
export function markAsVoted(surveyId: string): void {
  const votedIds: string[] = readVotedSurveyIds();
  if (votedIds.includes(surveyId)) {
    return;
  }
  try {
    localStorage.setItem(VOTED_SURVEYS_KEY, JSON.stringify([...votedIds, surveyId]));
  } catch {
    return;
  }
}

/**
 * Type guard for the parsed localStorage value, so no cast with "as" is needed.
 */
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item: unknown): boolean => typeof item === 'string');
}
