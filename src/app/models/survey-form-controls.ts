import { FormControl, FormGroup } from '@angular/forms';

import { Category } from './survey';

/**
 * Controls of the meta fields in the create survey form.
 * endDate holds the value of input type="date" ("YYYY-MM-DD"), empty means no end date.
 */
export interface SurveyMetaControls {
  title: FormControl<string>;
  category: FormControl<Category | null>;
  endDate: FormControl<string>;
  description: FormControl<string>;
}

/**
 * Typed form group of the meta fields, owned by create-survey.
 */
export type SurveyMetaGroup = FormGroup<SurveyMetaControls>;
