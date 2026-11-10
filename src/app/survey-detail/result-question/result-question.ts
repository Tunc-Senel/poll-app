import { Component, computed, input, InputSignal, Signal } from '@angular/core';

import { Answer, Question, VoteCounts } from '../../models/survey';
import { toPercent } from '../../utils/survey-utils';
import { ResultBar } from '../result-bar/result-bar';

/**
 * One answer together with its share of all votes of the question.
 */
interface AnswerResult {
  answer: Answer;
  percent: number;
}

/**
 * Results of one question: title and one bar per answer.
 * Turns the raw vote counts into percent per answer.
 */
@Component({
  imports: [ResultBar],
  selector: 'app-result-question',
  styleUrl: './result-question.scss',
  templateUrl: './result-question.html',
})
export class ResultQuestion {
  /**
   * Question with its answers, already sorted by position.
   */
  readonly question: InputSignal<Question> = input.required<Question>();

  /**
   * Votes per answer id of the whole survey, owned by survey-detail.
   */
  readonly voteCounts: InputSignal<VoteCounts> = input.required<VoteCounts>();

  /**
   * Sum of all votes of this question; with multiple choice one person can add several.
   */
  private readonly totalVotes: Signal<number> = computed((): number =>
    this.question().answers.reduce(
      (sum: number, answer: Answer): number => sum + this.votesFor(answer),
      0,
    ),
  );

  /**
   * Every answer with its percent, in the order of the question.
   */
  protected readonly results: Signal<AnswerResult[]> = computed((): AnswerResult[] =>
    this.question().answers.map(
      (answer: Answer): AnswerResult => ({
        answer,
        percent: toPercent(this.votesFor(answer), this.totalVotes()),
      }),
    ),
  );

  /**
   * Votes of one answer; 0 when the counts do not contain it yet.
   */
  private votesFor(answer: Answer): number {
    return this.voteCounts()[answer.id] ?? 0;
  }
}
