import { Component, inject } from '@angular/core';
import { UiService } from '../../services/ui.service';

/**
 * Hero section of the home page with title, illustration and the new survey button.
 */
@Component({
  selector: 'app-hero',
  styleUrl: './hero.scss',
  templateUrl: './hero.html',
})
export class Hero {
  private readonly uiService: UiService = inject(UiService);

  /**
   * Opens the create survey overlay via the UiService.
   */
  protected openCreateSurvey(): void {
    this.uiService.openCreate();
  }
}
