import { Component, computed, inject, OnInit, Signal, signal, WritableSignal } from '@angular/core';

import { Category, Survey, SurveyTab } from '../../models/survey';
import { SurveyService } from '../../services/survey.service';
import { byEarliestEnd, byLatestEnd, isSurveyActive } from '../../utils/survey-utils';
import { AllSurveys } from '../all-surveys/all-surveys';
import { EndingSoonSurveys } from '../ending-soon-surveys/ending-soon-surveys';
import { SurveyFilter } from '../survey-filter/survey-filter';

/**
 * Loads all surveys once and filters them by tab and category.
 * Shows a loading hint or an error message instead of the lists while needed.
 */
@Component({
  imports: [EndingSoonSurveys, SurveyFilter, AllSurveys],
  selector: 'app-survey-list',
  styleUrl: './survey-list.scss',
  templateUrl: './survey-list.html',
})
export class SurveyList implements OnInit {
  private readonly surveyService: SurveyService = inject(SurveyService);

  /**
   * All surveys from Supabase, unfiltered.
   */
  protected readonly surveys: WritableSignal<Survey[]> = signal<Survey[]>([]);

  /**
   * Selected tab, switched by survey-filter.
   */
  protected readonly activeTab: WritableSignal<SurveyTab> = signal<SurveyTab>('active');

  /**
   * Selected category, switched by survey-filter; null stands for "All Surveys".
   */
  protected readonly selectedCategory: WritableSignal<Category | null> = signal<Category | null>(
    null,
  );

  /**
   * True until the first load has finished, successfully or not.
   */
  protected readonly isLoading: WritableSignal<boolean> = signal<boolean>(true);

  /**
   * Shown instead of the lists; empty while there is no error.
   */
  protected readonly errorMessage: WritableSignal<string> = signal<string>('');

  /**
   * Surveys of the selected tab and category, sorted for that tab.
   */
  protected readonly filteredSurveys: Signal<Survey[]> = computed((): Survey[] => {
    const now: Date = new Date();
    const showActive: boolean = this.activeTab() === 'active';
    const category: Category | null = this.selectedCategory();
    return this.surveys()
      .filter((survey: Survey): boolean => isSurveyActive(survey, now) === showActive)
      .filter((survey: Survey): boolean => category === null || survey.category === category)
      .sort(showActive ? byEarliestEnd : byLatestEnd);
  });

  /**
   * Starts loading as soon as Angular has created the component.
   */
  ngOnInit(): void {
    this.fetchSurveys();
  }

  /**
   * Loads the surveys and switches the loading hint off in every case.
   * A readable message replaces the raw Supabase error.
   */
  private async fetchSurveys(): Promise<void> {
    try {
      this.surveys.set(await this.surveyService.loadSurveys());
    } catch {
      this.errorMessage.set('Surveys could not be loaded. Please try again later.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
