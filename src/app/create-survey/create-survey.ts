import {
  afterNextRender,
  afterRenderEffect,
  Component,
  ElementRef,
  inject,
  Injector,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';

import { MAX_QUESTIONS } from '../constants/survey-constants';
import { QuestionArray, SurveyMetaGroup } from '../models/survey-form-controls';
import { UiService } from '../services/ui.service';
import {
  createQuestionArray,
  createQuestionGroup,
  createSurveyMetaGroup,
} from '../utils/survey-form-factory';
import { QuestionEditor } from './question-editor/question-editor';
import { SurveyMetaForm } from './survey-meta-form/survey-meta-form';

/**
 * Overlay for creating a new survey, built on the native dialog element.
 * Stays in app.html all the time; the signal in UiService decides whether it is open.
 */
@Component({
  imports: [QuestionEditor, SurveyMetaForm],
  selector: 'app-create-survey',
  styleUrl: './create-survey.scss',
  templateUrl: './create-survey.html',
})
export class CreateSurvey {
  private readonly uiService: UiService = inject(UiService);

  private readonly injector: Injector = inject(Injector);

  /**
   * The dialog element; showModal() and close() are only available on the DOM element.
   */
  private readonly dialog: Signal<ElementRef<HTMLDialogElement>> =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  /**
   * Meta fields of the new survey. Owned here, because "Publish" and saving (22.4) live here.
   * A signal, so resetForm() can put in a fresh form group and the children redraw.
   */
  protected readonly metaForm: WritableSignal<SurveyMetaGroup> =
    signal<SurveyMetaGroup>(createSurveyMetaGroup());

  /**
   * Questions of the new survey, each with its answers. Starts with one question.
   */
  protected readonly questions: WritableSignal<QuestionArray> =
    signal<QuestionArray>(createQuestionArray());

  /**
   * Upper limit for the template, "Add next question" disappears at this number.
   */
  protected readonly maxQuestions: number = MAX_QUESTIONS;

  /**
   * True after the first click on "Publish"; survey-meta-form then shows all errors.
   */
  protected readonly isPublishAttempted: WritableSignal<boolean> = signal<boolean>(false);

  /**
   * True when the current click started outside the dialog box, on the backdrop.
   * Prevents closing when a text selection starts in a field and ends outside.
   */
  private isPointerDownOutside: boolean = false;

  /**
   * Opens or closes the dialog whenever the signal in UiService changes.
   * afterRenderEffect runs after rendering, so the dialog element already exists.
   */
  constructor() {
    afterRenderEffect((): void => {
      this.syncDialog(this.uiService.isCreateOpen());
    });
  }

  /**
   * Called by Cancel and the X: closes via the signal, the effect then closes the dialog.
   */
  protected close(): void {
    this.uiService.closeCreate();
  }

  /**
   * Adds an empty question below the others. The template hides the button at MAX_QUESTIONS.
   */
  protected addQuestion(): void {
    this.questions().push(createQuestionGroup());
  }

  /**
   * Removes a question after a click on its delete icon. Question 1 never asks for this.
   */
  protected removeQuestion(index: number): void {
    this.questions().removeAt(index);
  }

  /**
   * Submit of the form, also by Enter in a field: stops the page reload and shows all errors.
   * With errors the focus jumps to the first invalid field, so screen readers notice them.
   * Publish stays clickable on purpose. Saving the survey follows in step 22.4.
   */
  protected publish(event: Event): void {
    event.preventDefault();
    this.isPublishAttempted.set(true);
    if (this.metaForm().invalid || this.questions().invalid) {
      this.focusFirstInvalidField();
    }
  }

  /**
   * Runs on the close event of the dialog: after Cancel, X, Esc and a click on the backdrop.
   * Resets the signal, otherwise "New survey" would not open the dialog again,
   * and empties the form, so the dialog always opens blank.
   */
  protected onDialogClosed(): void {
    this.uiService.closeCreate();
    this.resetForm();
  }

  /**
   * Remembers whether a click starts on the backdrop, see onDialogClick().
   */
  protected onDialogPointerDown(event: PointerEvent): void {
    this.isPointerDownOutside = this.isOutsideDialog(event);
  }

  /**
   * Closes the dialog after a click on the backdrop, like Cancel.
   * Only if the click started there too, so a text selection that ends outside does not close it.
   */
  protected onDialogClick(event: MouseEvent): void {
    if (this.isPointerDownOutside && this.isOutsideDialog(event)) {
      this.close();
    }
  }

  /**
   * True for a click on the backdrop. The browser reports it as a click on the dialog itself,
   * so the position decides. The full-screen mobile dialog has no backdrop and never matches.
   */
  private isOutsideDialog(event: MouseEvent): boolean {
    const dialog: HTMLDialogElement = this.dialog().nativeElement;
    if (event.target !== dialog) {
      return false;
    }
    const box: DOMRect = dialog.getBoundingClientRect();
    const isBesideBox: boolean = event.clientX < box.left || event.clientX > box.right;
    const isAboveOrBelowBox: boolean = event.clientY < box.top || event.clientY > box.bottom;
    return isBesideBox || isAboveOrBelowBox;
  }

  /**
   * Puts in a fresh, empty form. New objects instead of reset(): reset() keeps extra questions
   * in the FormArray, and the OnPush children only redraw when their inputs get new objects.
   */
  private resetForm(): void {
    this.metaForm.set(createSurveyMetaGroup());
    this.questions.set(createQuestionArray());
    this.isPublishAttempted.set(false);
  }

  /**
   * Waits for the next render, when the error messages and aria-invalid exist,
   * then focuses the first marked field in the dialog (input or dropdown button).
   */
  private focusFirstInvalidField(): void {
    afterNextRender(
      (): void => {
        const field: HTMLElement | null =
          this.dialog().nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]');
        field?.focus();
      },
      { injector: this.injector },
    );
  }

  /**
   * Shows the dialog as a modal or closes it, but only if its state really differs.
   * showModal() on an open dialog would throw an error.
   */
  private syncDialog(isOpen: boolean): void {
    const dialog: HTMLDialogElement = this.dialog().nativeElement;
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }
}
