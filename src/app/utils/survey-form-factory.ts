import { FormControl, FormGroup, Validators } from '@angular/forms';

import { NOT_BLANK_PATTERN } from '../constants/survey-constants';
import { SurveyMetaControls, SurveyMetaGroup } from '../models/survey-form-controls';
import { Category } from '../models/survey';
import { notInPastValidator } from './survey-validators';

/**
 * Builds an empty meta form: title and category required, end date not in the past.
 * A function instead of a field, so step 22.5 can build a fresh form after closing.
 */
export function createSurveyMetaGroup(): SurveyMetaGroup {
  return new FormGroup<SurveyMetaControls>({
    title: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(NOT_BLANK_PATTERN)],
    }),
    category: new FormControl<Category | null>(null, Validators.required),
    endDate: new FormControl<string>('', { nonNullable: true, validators: notInPastValidator }),
    description: new FormControl<string>('', { nonNullable: true }),
  });
}
