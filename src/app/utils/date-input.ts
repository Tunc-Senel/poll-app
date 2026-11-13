/**
 * Length of month and day in "YYYY-MM-DD", filled up with a leading zero.
 */
const DATE_PART_LENGTH: number = 2;

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
