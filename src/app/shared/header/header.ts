import { Component, inject, input, InputSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiService } from '../../services/ui.service';

/**
 * Page the header is shown on.
 */
export type HeaderVariant = 'home' | 'detail';

/**
 * Page header with logo and, on the detail page, the create survey button.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  /**
   * Controls logo and create button. Defaults to the home variant.
   */
  readonly variant: InputSignal<HeaderVariant> = input<HeaderVariant>('home');

  private readonly uiService: UiService = inject(UiService);

  /**
   * Opens the create survey overlay via the UiService.
   */
  protected openCreateSurvey(): void {
    this.uiService.openCreate();
  }
}
