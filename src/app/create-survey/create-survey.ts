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

import { SurveyMetaGroup } from '../models/survey-form-controls';
import { UiService } from '../services/ui.service';
import { createSurveyMetaGroup } from '../utils/survey-form-factory';
import { SurveyMetaForm } from './survey-meta-form/survey-meta-form';

/**
 * Overlay for creating a new survey, built on the native dialog element.
 * Stays in app.html all the time; the signal in UiService decides whether it is open.
 */
@Component({
  imports: [SurveyMetaForm],
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
   */
  protected readonly metaForm: SurveyMetaGroup = createSurveyMetaGroup();

  /**
   * True after the first click on "Publish"; survey-meta-form then shows all errors.
   */
  protected readonly isPublishAttempted: WritableSignal<boolean> = signal<boolean>(false);

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
   * Submit of the form, also by Enter in a field: stops the page reload and shows all errors.
   * With errors the focus jumps to the first invalid field, so screen readers notice them.
   * Publish stays clickable on purpose. Saving the survey follows in step 22.4.
   */
  protected publish(event: Event): void {
    event.preventDefault();
    this.isPublishAttempted.set(true);
    if (this.metaForm.invalid) {
      this.focusFirstInvalidField();
    }
  }

  /**
   * Runs on the close event of the dialog, also after Esc, which closes it without our code.
   * Resets the signal, otherwise "New survey" would not open the dialog again.
   */
  protected onDialogClosed(): void {
    this.uiService.closeCreate();
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
