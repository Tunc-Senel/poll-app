/**
 * Shows a dialog as a modal or closes it, but only if its state really differs.
 * showModal() on an open dialog would throw an error.
 * Shared by create-survey and publish-confirmation.
 */
export function syncDialog(dialog: HTMLDialogElement, isOpen: boolean): void {
  if (isOpen && !dialog.open) {
    dialog.showModal();
  } else if (!isOpen && dialog.open) {
    dialog.close();
  }
}
