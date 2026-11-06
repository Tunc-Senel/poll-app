import { Category } from './survey';

/**
 * One entry in the dropdown list.
 * value null stands for "All Surveys" in the filter; label is the visible text.
 */
export interface DropdownOption {
  value: Category | null;
  label: string;
}
