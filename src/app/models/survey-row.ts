/**
 * Row of the surveys table as returned by Supabase.
 * Timestamps arrive as ISO strings; only survey-service uses this type.
 */
export interface SurveyRow {
  id: string;
  created_at: string;
  title: string;
  category: string;
  description: string | null;
  end_date: string | null;
}

/**
 * Row of the questions table as returned by Supabase.
 */
export interface QuestionRow {
  id: string;
  survey_id: string;
  text: string;
  allow_multiple: boolean;
  position: number;
}

/**
 * Row of the answers table as returned by Supabase.
 */
export interface AnswerRow {
  id: string;
  question_id: string;
  text: string;
  position: number;
}

/**
 * Question row with its embedded answers,
 * as returned by the nested detail query.
 */
export interface QuestionWithAnswersRow extends QuestionRow {
  answers: AnswerRow[];
}

/**
 * Survey row with its embedded questions and answers,
 * as returned by the nested detail query. Contains no votes.
 */
export interface SurveyDetailRow extends SurveyRow {
  questions: QuestionWithAnswersRow[];
}

/**
 * Answer with its vote count, as returned by the vote count query.
 * Supabase wraps the count in an array, e.g. [{ count: 3 }].
 */
export interface AnswerVotesRow {
  id: string;
  votes: { count: number }[];
}

/**
 * Question with the vote counts of its answers,
 * as returned by the vote count query.
 */
export interface QuestionVotesRow {
  answers: AnswerVotesRow[];
}

/**
 * New row for the votes table; id and created_at are set by Supabase.
 */
export interface VoteInsertRow {
  answer_id: string;
}
