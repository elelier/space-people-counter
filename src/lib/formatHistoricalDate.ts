/** Formats a YYYY-MM-DD calendar date without shifting it in the visitor's timezone. */
export function formatHistoricalDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
}
