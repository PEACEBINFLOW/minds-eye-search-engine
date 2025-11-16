import { MindEyeEvent, MindEyeSource } from "../types/events";

export interface TimeRange {
  from?: string; // ISO
  to?: string;   // ISO
}

export interface SearchFilters {
  sources?: MindEyeSource[];
  kinds?: string[];
  timeRange?: TimeRange;
  text?: string;
}

/**
 * Filter events by source, kind, and time.
 */
export function filterEvents<T>(
  events: MindEyeEvent<T>[],
  filters: SearchFilters
): MindEyeEvent<T>[] {
  return events.filter((event) => {
    if (filters.sources && filters.sources.length > 0) {
      if (!filters.sources.includes(event.source)) return false;
    }

    if (filters.kinds && filters.kinds.length > 0) {
      if (!filters.kinds.includes(event.kind)) return false;
    }

    if (filters.timeRange) {
      const ts = new Date(event.createdAt).getTime();
      if (filters.timeRange.from) {
        const from = new Date(filters.timeRange.from).getTime();
        if (ts < from) return false;
      }
      if (filters.timeRange.to) {
        const to = new Date(filters.timeRange.to).getTime();
        if (ts > to) return false;
      }
    }

    return true;
  });
}
