import {
  afterRenderEffect,
  Component,
  ElementRef,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  viewChild,
} from '@angular/core';

import { syncDialog } from '../../utils/dialog';

/**
 * Small modal overlay after publishing: "Your survey is now published!".
 * create-survey opens it; closing it (X or Esc) is reported, create-survey then opens the survey.
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
   * Reports that the confirmation was closed, by the X or by Esc.
   */
  readonly closed: OutputEmitterRef<void> = output<void>();

  /**
   * The dialog element; showModal() and close() are only available on the DOM element.
   */
  private readonly dialog: Signal<ElementRef<HTMLDialogElement>> =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  /**
   * Opens or closes the dialog whenever isOpen changes, after rendering.
   */
  constructor() {
    afterRenderEffect((): void => {
      syncDialog(this.dialog().nativeElement, this.isOpen());
    });
  }

  /**
   * The X closes the dialog; the close event then reports it like Esc does.
   */
  protected close(): void {
    this.dialog().nativeElement.close();
  }

  /**
   * Runs on the close event of the dialog, after the X and after Esc.
   */
  protected onDialogClosed(): void {
    this.closed.emit();
  }
}
