import { Service } from '@angular/core';
import { createClient, PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Answer, Category, Question, Survey, SurveyDetail, VoteCounts } from '../models/survey';
import { CATEGORIES } from '../constants/survey-constants';
import {
  AnswerRow,
  QuestionVotesRow,
  QuestionWithAnswersRow,
  SurveyDetailRow,
  SurveyRow,
  VoteInsertRow,
} from '../models/survey-row';

/**
 * Single place for all Supabase access.
 * Components never talk to Supabase directly.
 */
@Service()
export class SurveyService {
  private readonly supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey,
  );

  /**
   * Loads all surveys without questions for the home page.
   * Surveys with an unknown category are skipped.
   */
  async loadSurveys(): Promise<Survey[]> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select('*')
      .overrideTypes<SurveyRow[], { merge: false }>();
    this.throwIfError(error);
    return (data ?? []).flatMap((row) => {
      const survey: Survey | null = this.toSurvey(row);
      return survey === null ? [] : [survey];
    });
  }

  /**
   * Loads one survey with its questions and answers, without votes.
   * Returns null if no survey with this id exists.
   * Uses a typed variable instead of overrideTypes, because overrideTypes
   * does not work with maybeSingle without generated database types.
   */
  async loadSurveyDetail(id: string): Promise<SurveyDetail | null> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select('*, questions(*, answers(*))')
      .eq('id', id)
      .maybeSingle();
    this.throwIfError(error);
    const row: SurveyDetailRow | null = data;
    if (row === null) {
      return null;
    }
    return this.toSurveyDetail(row);
  }

  /**
   * Loads the number of votes per answer of one survey.
   * Used on first load and after every realtime event.
   */
  async loadVoteCounts(surveyId: string): Promise<VoteCounts> {
    const { data, error } = await this.supabase
      .from('questions')
      .select('answers(id, votes(count))')
      .eq('survey_id', surveyId)
      .overrideTypes<QuestionVotesRow[], { merge: false }>();
    this.throwIfError(error);
    return this.toVoteCounts(data ?? []);
  }

  /**
   * Saves one vote row per chosen answer, all in a single insert.
   * Realtime then reports each row like any other vote.
   */
  async castVotes(answerIds: string[]): Promise<void> {
    const rows: VoteInsertRow[] = answerIds.map(
      (answerId: string): VoteInsertRow => ({ answer_id: answerId }),
    );
    const { error } = await this.supabase.from('votes').insert(rows);
    this.throwIfError(error);
  }

  /**
   * Checks whether a value from the database is one of the known categories.
   * Narrows the type to Category, so no cast is needed afterwards.
   */
  private isCategory(value: string): value is Category {
    return CATEGORIES.some((category) => category === value);
  }

  /**
   * Converts a timestamp string from the database into a Date.
   * Returns null if there is no value, e.g. a survey without end date.
   */
  private toDate(value: string | null): Date | null {
    return value === null ? null : new Date(value);
  }

  /**
   * Compares two items by their position for ascending sorting.
   * Works for questions and answers, since both have a position field.
   */
  private byPosition(a: { position: number }, b: { position: number }): number {
    return a.position - b.position;
  }

  /**
   * Converts an answer row into an Answer.
   */
  private toAnswer(row: AnswerRow): Answer {
    return {
      id: row.id,
      text: row.text,
      position: row.position,
    };
  }

  /**
   * Converts a question row into a Question.
   * Its answers are sorted by position and converted as well.
   */
  private toQuestion(row: QuestionWithAnswersRow): Question {
    return {
      id: row.id,
      text: row.text,
      allowMultiple: row.allow_multiple,
      position: row.position,
      answers: [...row.answers]
        .sort((a, b) => this.byPosition(a, b))
        .map((answer) => this.toAnswer(answer)),
    };
  }

  /**
   * Converts a survey row into a Survey.
   * Returns null if the category is not in CATEGORIES.
   */
  private toSurvey(row: SurveyRow): Survey | null {
    if (!this.isCategory(row.category)) {
      return null;
    }
    return {
      id: row.id,
      title: row.title,
      category: row.category,
      description: row.description,
      endDate: this.toDate(row.end_date),
    };
  }

  /**
   * Converts a survey row with embedded questions into a SurveyDetail.
   * Returns null if the category is not in CATEGORIES.
   */
  private toSurveyDetail(row: SurveyDetailRow): SurveyDetail | null {
    const survey: Survey | null = this.toSurvey(row);
    if (survey === null) {
      return null;
    }
    return {
      ...survey,
      questions: [...row.questions]
        .sort((a, b) => this.byPosition(a, b))
        .map((question) => this.toQuestion(question)),
    };
  }

  /**
   * Flattens the vote count rows into one entry per answer id.
   * Answers without votes get 0.
   */
  private toVoteCounts(rows: QuestionVotesRow[]): VoteCounts {
    const voteCounts: VoteCounts = {};
    for (const question of rows) {
      for (const answer of question.answers) {
        voteCounts[answer.id] = answer.votes[0]?.count ?? 0;
      }
    }
    return voteCounts;
  }

  /**
   * Throws the Supabase error, if there is one,
   * so the calling component can show a message.
   */
  private throwIfError(error: PostgrestError | null): void {
    if (error !== null) {
      throw error;
    }
  }
}
