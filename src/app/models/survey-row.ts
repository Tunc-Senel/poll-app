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
