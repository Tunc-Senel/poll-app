import { Component, computed, input, InputSignal, Signal } from '@angular/core';

import { PERCENT_SCALE } from '../../constants/survey-constants';
import { Answer } from '../../models/survey';
import { toAnswerLetter } from '../../utils/survey-utils';

/**
 * One answer in the results: letter, bar and percent.
 * Only shows values, the percent is calculated by result-question.
 */
@Component({
  imports: [],
  selector: 'app-result-bar',
  styleUrl: './result-bar.scss',
  templateUrl: './result-bar.html',
})
export class ResultBar {
  /**
   * Answer this bar belongs to.
   */
  readonly answer: InputSignal<Answer> = input.required<Answer>();

  /**
   * Whole percent between 0 and 100.
   */
  readonly percent: InputSignal<number> = input.required<number>();

  /**
   * Upper end of the meter, the same scale toPercent calculates with.
   */
  protected readonly maxPercent: number = PERCENT_SCALE;

  /**
   * Letter A to F taken from the answer position.
   */
  protected readonly letter: Signal<string> = computed((): string =>
    toAnswerLetter(this.answer().position),
  );

  /**
   * Accessible name of the meter, because the design only shows the letter, not the answer text.
   */
  protected readonly label: Signal<string> = computed(
    (): string => `${this.letter()}. ${this.answer().text}`,
  );
}
