export interface TimeRemaining {
  text: string;
  overdue: boolean;
  percent: number; // 0-100 progress through the trip
}

/**
 * Format the remaining time to return.
 * - `endStr` in the future → "2h 14m left"
 * - `endStr` in the past   → "1h 30m overdue"
 * - less than a minute     → "due now"
 * - `startStr` optional, used to compute the progress percent.
 */
export function formatTimeRemaining(
  endStr?: string | null,
  startStr?: string | null,
): TimeRemaining | null {
  if (!endStr) return null;
  const end = new Date(endStr).getTime();
  if (Number.isNaN(end)) return null;

  const now = Date.now();
  const start = startStr ? new Date(startStr).getTime() : null;
  const diff = end - now;
  const abs = Math.abs(diff);
  const hours = Math.floor(abs / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);

  let core: string;
  if (abs < 60_000) core = "due now";
  else if (hours === 0) core = `${minutes}m`;
  else if (hours < 24) core = minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
  else {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    core = remHours === 0 ? `${days}d` : `${days}d ${remHours}h`;
  }

  let percent = 0;
  if (start && end > start) {
    percent = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  }

  return {
    text: diff < 0 ? `${core} overdue` : core === "due now" ? "due now" : `${core} left`,
    overdue: diff < 0,
    percent,
  };
}
