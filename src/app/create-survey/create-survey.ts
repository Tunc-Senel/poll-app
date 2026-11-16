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
import { NewSurvey } from '../models/survey';
import { QuestionArray, SurveyMetaGroup } from '../models/survey-form-controls';
import { SurveyService } from '../services/survey.service';
import { UiService } from '../services/ui.service';
import { syncDialog } from '../utils/dialog';
import { toNewSurvey } from '../utils/new-survey';
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

  private readonly surveyService: SurveyService = inject(SurveyService);

  private readonly router: Router = inject(Router);

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
   * True while the survey is being saved: "Publish" is disabled and the dialog cannot be closed.
   */
  protected readonly isSaving: WritableSignal<boolean> = signal<boolean>(false);

  /**
   * True after saving failed; the dialog shows a message and stays open.
   */
  protected readonly isSaveFailed: WritableSignal<boolean> = signal<boolean>(false);

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
      syncDialog(this.dialog().nativeElement, this.uiService.isCreateOpen());
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
   * A valid form is saved. Enter while saving does nothing, so nothing is saved twice.
   */
  protected publish(event: Event): void {
    event.preventDefault();
    if (this.isSaving()) {
      return;
    }
    this.isPublishAttempted.set(true);
    const survey: NewSurvey | null = this.readValidSurvey();
    if (survey === null) {
      this.focusFirstInvalidField();
      return;
    }
    void this.saveSurvey(survey);
  }

  /**
   * Blocks Esc while saving, otherwise the form would be reset while the requests still run.
   * Chrome lets a second Esc in a row close the dialog anyway (see plan, known limit).
   */
  protected onDialogCancel(event: Event): void {
    if (this.isSaving()) {
      event.preventDefault();
    }
  }

  /**
   * Runs on the close event of the dialog: after Cancel, X, Esc, a click on the backdrop
   * and after publishing. Resets the signal, otherwise "New survey" would not open
   * the dialog again, and empties the form, so the dialog always opens blank.
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
    if (this.isPointerDownOutside && this.isOutsideDialog(event) && !this.isSaving()) {
      this.close();
    }
  }

  /**
   * The form as a NewSurvey, or null while any field is invalid.
   */
  private readValidSurvey(): NewSurvey | null {
    if (this.metaForm().invalid || this.questions().invalid) {
      return null;
    }
    return toNewSurvey(this.metaForm(), this.questions());
  }

  /**
   * Saves the survey. On success the dialog closes and the confirmation opens,
   * on failure a message appears and the dialog stays open with all entries.
   */
  private async saveSurvey(survey: NewSurvey): Promise<void> {
    this.isSaving.set(true);
    this.isSaveFailed.set(false);
    try {
      const surveyId: string = await this.surveyService.createSurvey(survey);
      this.uiService.closeCreate();
    } catch {
      this.isSaveFailed.set(true);
    } finally {
      this.isSaving.set(false);
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
    this.isSaveFailed.set(false);
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
}
