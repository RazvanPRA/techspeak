const pad = (n: number) => String(n).padStart(2, '0');

/** The local calendar day of `date` as "YYYY-MM-DD" (what a streak counts, not UTC days). */
export function toLocalDay(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
