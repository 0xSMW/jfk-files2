/**
 * Formats document date strings safely.
 * Handles literal "YYYY-MM-DD", empty strings, null/undefined, and valid dates.
 * Example outputs: "May 14, 1963", "Date unknown"
 */
export function formatDocDate(dateStr?: string | null): string {
  if (!dateStr || dateStr.trim() === '' || dateStr === 'YYYY-MM-DD' || dateStr.includes('YYYY')) {
    return 'Date unknown';
  }

  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    return 'Date unknown';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(parsed);
}

export function isKnownDate(dateStr?: string | null): boolean {
  if (!dateStr || dateStr.trim() === '' || dateStr === 'YYYY-MM-DD' || dateStr.includes('YYYY')) {
    return false;
  }
  const parsed = new Date(dateStr);
  return !isNaN(parsed.getTime());
}

/**
 * Returns a numerical timestamp for sorting, where invalid/unknown dates sort last.
 */
export function getSortableTimestamp(dateStr?: string | null, asc: boolean = false): number {
  if (!isKnownDate(dateStr)) {
    return asc ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
  }
  return new Date(dateStr!).getTime();
}
