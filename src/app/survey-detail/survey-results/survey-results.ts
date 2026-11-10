import {
  Component,
  computed,
  input,
  InputSignal,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';

import { Question, VoteCounts } from '../../models/survey';
import { ResultQuestion } from '../result-question/result-question';

/**
 * Results column of the detail page: heading, LIVE badge and one block per question.
 * Only shows the vote counts it gets from survey-detail and never loads data itself.
 * On tablet and mobile the content can be collapsed with "See results" / "Close results".
 */
@Component({
  imports: [ResultQuestion],
  selector: 'app-survey-results',
  styleUrl: './survey-results.scss',
  templateUrl: './survey-results.html',
})
export class SurveyResults {
  /**
   * Questions of the survey, already sorted by position.
   */
  readonly questions: InputSignal<Question[]> = input.required<Question[]>();

  /**
   * Votes per answer id, owned by survey-detail.
   */
  readonly voteCounts: InputSignal<VoteCounts> = input.required<VoteCounts>();

  /**
   * Shows the LIVE badge only for running surveys.
   */
  readonly isActive: InputSignal<boolean> = input.required<boolean>();

  /**
   * Open or closed on tablet and mobile; on desktop the content is always visible.
   */
  protected readonly isExpanded: WritableSignal<boolean> = signal<boolean>(true);

  /**
   * False as long as nobody has voted, then the empty state is shown instead of bars.
   */
  protected readonly hasVotes: Signal<boolean> = computed((): boolean =>
    Object.values(this.voteCounts()).some((count: number): boolean => count > 0),
  );

  /**
   * Switches between "See results" and "Close results".
   */
  protected toggleExpanded(): void {
    this.isExpanded.update((isExpanded: boolean): boolean => !isExpanded);
  }
}
