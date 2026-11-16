/**
 * Length of month and day in "YYYY-MM-DD", filled up with a leading zero.
 */
const DATE_PART_LENGTH: number = 2;

/**
 * Last hour, minute and second of a day; a survey runs until then on its end date.
 */
const LAST_HOUR: number = 23;
const LAST_MINUTE: number = 59;
const LAST_SECOND: number = 59;

/**
 * Turns a date into the "YYYY-MM-DD" format of input type="date", in local time.
 * getMonth() counts from 0, hence the + 1.
 */
export function toDateInputValue(date: Date): string {
  const year: string = String(date.getFullYear());
  const month: string = String(date.getMonth() + 1).padStart(DATE_PART_LENGTH, '0');
  const day: string = String(date.getDate()).padStart(DATE_PART_LENGTH, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Turns the value of input type="date" into the end of that day (23:59:59) in local time.
 * Built from year, month and day, because new Date('YYYY-MM-DD') would read UTC midnight.
 * An empty field means the survey never ends.
 */
export function toEndOfDay(value: string): Date | null {
  if (value === '') {
    return null;
  }
  const [year, month, day]: number[] = value.split('-').map(Number);
  return new Date(year, month - 1, day, LAST_HOUR, LAST_MINUTE, LAST_SECOND);
}
