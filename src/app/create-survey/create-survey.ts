import { afterRenderEffect, Component, ElementRef, inject, Signal, viewChild } from '@angular/core';

import { UiService } from '../services/ui.service';

/**
 * Overlay for creating a new survey, built on the native dialog element.
 * Stays in app.html all the time; the signal in UiService decides whether it is open.
 */
@Component({
  selector: 'app-create-survey',
  styleUrl: './create-survey.scss',
  templateUrl: './create-survey.html',
})
export class CreateSurvey {
  private readonly uiService: UiService = inject(UiService);

  /**
   * The dialog element; showModal() and close() are only available on the DOM element.
   */
  private readonly dialog: Signal<ElementRef<HTMLDialogElement>> =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

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
   * Runs on the close event of the dialog, also after Esc, which closes it without our code.
   * Resets the signal, otherwise "New survey" would not open the dialog again.
   */
  protected onDialogClosed(): void {
    this.uiService.closeCreate();
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
