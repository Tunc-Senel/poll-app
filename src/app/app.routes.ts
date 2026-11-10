import { Routes } from '@angular/router';

import type { Home } from './home/home';
import type { SurveyDetail } from './survey-detail/survey-detail';

/**
 * Loads the home page only when its route is visited.
 */
async function loadHome(): Promise<typeof Home> {
  return (await import('./home/home')).Home;
}

/**
 * Loads the detail page with all its child components only when its route is visited.
 */
async function loadSurveyDetail(): Promise<typeof SurveyDetail> {
  return (await import('./survey-detail/survey-detail')).SurveyDetail;
}

export const routes: Routes = [
  { path: '', loadComponent: loadHome },
  { path: 'survey/:id', loadComponent: loadSurveyDetail },
  { path: '**', redirectTo: '' },
];
