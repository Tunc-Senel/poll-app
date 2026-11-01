import { Service, signal, Signal, WritableSignal } from '@angular/core';

/**
 * UI state shared by components that are not parent and child.
 * Currently only whether the create-survey dialog is open.
 */
@Service()
export class UiService {
  /**
   * Writable source of the dialog state; only this service changes it.
   */
  private readonly _isCreateOpen: WritableSignal<boolean> = signal(false);

  /**
   * Read-only view for header, hero and create-survey.
   */
  readonly isCreateOpen: Signal<boolean> = this._isCreateOpen.asReadonly();

  /**
   * Opens the create-survey dialog.
   */
  openCreate(): void {
    this._isCreateOpen.set(true);
  }

  /**
   * Closes the create-survey dialog.
   */
  closeCreate(): void {
    this._isCreateOpen.set(false);
  }
}
