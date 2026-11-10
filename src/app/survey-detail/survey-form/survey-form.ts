import {
  Component,
  computed,
  inject,
  input,
  InputSignal,
  linkedSignal,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';

import { AnswerSelection, Question, SurveyDetail } from '../../models/survey';
import { SurveyService } from '../../services/survey.service';
import { isSurveyActive } from '../../utils/survey-utils';
import { markAsVoted } from '../../utils/voted-surveys';
import { SurveyInfo } from '../survey-info/survey-info';
import { SurveyQuestion } from '../survey-question/survey-question';

/**
 * Voting card of one survey: info head, all questions and the submit button.
 * Saves one vote per chosen answer and reports success to survey-detail.
 * Locked after voting, while saving and for ended surveys.
 */
@Component({
  imports: [SurveyInfo, SurveyQuestion],
  selector: 'app-survey-form',
  styleUrl: './survey-form.scss',
  templateUrl: './survey-form.html',
})
export class SurveyForm {
  private readonly surveyService: SurveyService = inject(SurveyService);

  /**
   * Survey with questions and answers, owned by survey-detail.
   */
  readonly survey: InputSignal<SurveyDetail> = input.required<SurveyDetail>();

  /**
   * True when this browser has already voted, owned by survey-detail.
   */
  readonly hasVoted: InputSignal<boolean> = input.required<boolean>();

  /**
   * Fires after the votes are saved, so survey-detail can update its voted state.
   */
  readonly voted: OutputEmitterRef<void> = output<void>();

  /**
   * Chosen answer ids per question id.
   * Linked to the survey id: a new survey starts empty, new vote counts keep the choice.
   */
  protected readonly selectedAnswers: WritableSignal<AnswerSelection> = linkedSignal<
    string,
    AnswerSelection
  >({
    source: (): string => this.survey().id,
    computation: (): AnswerSelection => ({}),
  });

  /**
   * True while the votes are being saved.
   */
  protected readonly isSubmitting: WritableSignal<boolean> = signal<boolean>(false);

  /**
   * Shown above the button when saving failed; empty otherwise.
   */
  protected readonly errorMessage: WritableSignal<string> = signal<string>('');

  /**
   * False for ended surveys, which can be viewed but not answered.
   */
  protected readonly isActive: Signal<boolean> = computed((): boolean =>
    isSurveyActive(this.survey(), new Date()),
  );

  /**
   * Disables all questions after voting, while saving and for ended surveys.
   */
  protected readonly isLocked: Signal<boolean> = computed(
    (): boolean => this.hasVoted() || !this.isActive() || this.isSubmitting(),
  );

  /**
   * The button is only active when every question has at least one answer.
   */
  protected readonly canSubmit: Signal<boolean> = computed(
    (): boolean =>
      !this.isLocked() &&
      this.survey().questions.every(
        (question: Question): boolean => this.selectionFor(question.id).length > 0,
      ),
  );

  /**
   * Chosen answer ids of one question; empty when nothing is chosen yet.
   */
  protected selectionFor(questionId: string): string[] {
    return this.selectedAnswers()[questionId] ?? [];
  }

  /**
   * Replaces the selection of one question and keeps all others.
   */
  protected updateSelection(questionId: string, answerIds: string[]): void {
    this.selectedAnswers.update(
      (current: AnswerSelection): AnswerSelection => ({ ...current, [questionId]: answerIds }),
    );
  }

  /**
   * Stops the browser from reloading the page and saves the votes if the form is complete.
   */
  protected submitVotes(event: Event): void {
    event.preventDefault();
    if (this.canSubmit()) {
      this.saveVotes();
    }
  }

  /**
   * Saves the votes, remembers the survey in localStorage and reports success.
   * Survey id and answer ids are read before the await, so later changes cannot mix in.
   * On an error the form stays open with a message, so the user can try again.
   */
  private async saveVotes(): Promise<void> {
    const surveyId: string = this.survey().id;
    const answerIds: string[] = Object.values(this.selectedAnswers()).flat();
    this.isSubmitting.set(true);
    this.errorMessage.set('');
    try {
      await this.surveyService.castVotes(answerIds);
      markAsVoted(surveyId);
      this.voted.emit();
    } catch {
      this.errorMessage.set('Your vote could not be saved. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
