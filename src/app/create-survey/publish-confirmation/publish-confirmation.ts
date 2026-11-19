import {
  afterRenderEffect,
  Component,
  effect,
  EffectCleanupRegisterFn,
  ElementRef,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  viewChild,
} from '@angular/core';

import { PUBLISH_CONFIRMATION_MS } from '../../constants/survey-constants';
import { syncDialog } from '../../utils/dialog';

/**
 * Small modal overlay after publishing: "Your survey is now published!".
 * create-survey opens it; it closes by itself after PUBLISH_CONFIRMATION_MS
 * and reports that, create-survey then opens the survey.
 */
@Component({
  imports: [],
  selector: 'app-publish-confirmation',
  styleUrl: './publish-confirmation.scss',
  templateUrl: './publish-confirmation.html',
})
export class PublishConfirmation {
  /**
   * True while create-survey has a freshly published survey to show.
   */
  readonly isOpen: InputSignal<boolean> = input.required<boolean>();

  /**
   * Reports that the confirmation has closed.
   */
  readonly closed: OutputEmitterRef<void> = output<void>();

  /**
   * The dialog element; showModal() and close() are only available on the DOM element.
   */
  private readonly dialog: Signal<ElementRef<HTMLDialogElement>> =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  /**
   * Opens or closes the dialog whenever isOpen changes, after rendering.
   * A second effect closes it after PUBLISH_CONFIRMATION_MS; onCleanup stops the timer
   * when isOpen changes before, so an old timer never closes a later confirmation.
   */
  constructor() {
    afterRenderEffect((): void => {
      syncDialog(this.dialog().nativeElement, this.isOpen());
    });
    effect((onCleanup: EffectCleanupRegisterFn): void => {
      if (this.isOpen()) {
        const timer: number = window.setTimeout((): void => this.close(), PUBLISH_CONFIRMATION_MS);
        onCleanup((): void => window.clearTimeout(timer));
      }
    });
  }

  /**
   * Esc does not close the confirmation, it closes by itself.
   * Chrome lets a second Esc in a row close it anyway; then the survey simply opens sooner.
   */
  protected onDialogCancel(event: Event): void {
    event.preventDefault();
  }

  /**
   * Runs on the close event of the dialog, after the timer.
   */
  protected onDialogClosed(): void {
    this.closed.emit();
  }

  /**
   * Closes the dialog; the close event then reports it.
   */
  private close(): void {
    this.dialog().nativeElement.close();
  }
}
