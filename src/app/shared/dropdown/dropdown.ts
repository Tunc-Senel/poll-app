import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';

import { DropdownOption } from '../../models/dropdown-option';
import { Category } from '../../models/survey';

/**
 * Custom dropdown with a fixed button text and the chosen option shown below it.
 * Holds only its open state, the parent owns the selected value.
 * Closes on selection, on Escape and on a click outside.
 */
@Component({
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(keydown.escape)': 'onEscape($event)',
    '(focusout)': 'onFocusOut($event)',
  },
  imports: [],
  selector: 'app-dropdown',
  styleUrl: './dropdown.scss',
  templateUrl: './dropdown.html',
})
export class Dropdown {
  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);

  /**
   * Toggle button, needed to give the focus back after closing.
   */
  private readonly toggleButton: Signal<ElementRef<HTMLButtonElement>> =
    viewChild.required<ElementRef<HTMLButtonElement>>('toggleButton');

  /**
   * Text on the toggle button, e.g. "Sort by categories".
   */
  readonly label: InputSignal<string> = input.required<string>();

  /**
   * Entries shown in the open list.
   */
  readonly options: InputSignal<DropdownOption[]> = input.required<DropdownOption[]>();

  /**
   * Value chosen by the parent; null means nothing chosen or "All Surveys".
   */
  readonly selected: InputSignal<Category | null> = input.required<Category | null>();

  /**
   * Sends the value of the clicked entry.
   */
  readonly optionSelected: OutputEmitterRef<Category | null> = output<Category | null>();

  /**
   * Reports that the open list was closed, with or without a choice.
   */
  readonly closed: OutputEmitterRef<void> = output<void>();

  /**
   * True while the list is open.
   */
  protected readonly isOpen: WritableSignal<boolean> = signal<boolean>(false);

  /**
   * Text of the chosen entry below the button, empty when nothing is chosen.
   */
  protected readonly selectedLabel: Signal<string> = computed((): string => {
    const value: Category | null = this.selected();
    if (value === null) {
      return '';
    }
    const match: DropdownOption | undefined = this.options().find(
      (option: DropdownOption): boolean => option.value === value,
    );
    return match?.label ?? '';
  });

  /**
   * Opens the list, or closes it when it is already open.
   */
  protected toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.isOpen.set(true);
    }
  }

  /**
   * Reports the chosen value, closes the list and keeps the focus on the button.
   */
  protected select(value: Category | null): void {
    this.optionSelected.emit(value);
    this.close();
    this.focusToggle();
  }

  /**
   * Closes the list when the click target lies outside this dropdown.
   */
  protected onDocumentClick(event: MouseEvent): void {
    if (event.target instanceof Node && !this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  /**
   * Closes an open list and stops the key from also closing a surrounding dialog.
   */
  protected onEscape(event: Event): void {
    if (!this.isOpen()) {
      return;
    }
    event.preventDefault();
    this.close();
    this.focusToggle();
  }

  /**
   * Closes the list when the keyboard focus moves to an element outside this dropdown.
   * Without a known target (e.g. a click on plain text) the document click handles it.
   */
  protected onFocusOut(event: FocusEvent): void {
    const next: EventTarget | null = event.relatedTarget;
    if (next instanceof Node && !this.elementRef.nativeElement.contains(next)) {
      this.close();
    }
  }

  /**
   * Closes the list and reports it, but only if it was open.
   */
  private close(): void {
    if (!this.isOpen()) {
      return;
    }
    this.isOpen.set(false);
    this.closed.emit();
  }

  /**
   * Puts the focus back on the toggle button, the list entries disappear on close.
   */
  private focusToggle(): void {
    this.toggleButton().nativeElement.focus();
  }
}
