import { MindEyeEvent } from "../types/events";

export interface DailyCount {
  day: string; // YYYY-MM-DD
  count: number;
}

/**
 * Count events per day based on createdAt timestamp.
 */
export function countEventsPerDay<T>(
  events: MindEyeEvent<T>[]
): DailyCount[] {
  const counts: Map<string, number> = new Map();

  for (const e of events) {
    const d = new Date(e.createdAt);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    const key = `${year}-${month}-${day}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([day, count]) => ({ day, count }));
}
