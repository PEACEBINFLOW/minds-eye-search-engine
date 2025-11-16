import { MindEyeEvent } from "../types/events";
import { SearchFilters, filterEvents } from "./filters";
import { buildTrigramIndex, searchTrigramIndex, TrigramIndex } from "./trigram";

export interface SearchOptions {
  useTrigram?: boolean;
}

interface IndexedState<T> {
  events: MindEyeEvent<T>[];
  trigramIndex?: TrigramIndex;
}

/**
 * Simple in-memory search state.
 * In a real deployment, this would be backed by a database or search engine.
 */
export class InMemorySearchStore<T = any> {
  private state: IndexedState<T> = { events: [] };

  loadEvents(events: MindEyeEvent<T>[]): void {
    this.state.events = events;
    this.state.trigramIndex = buildTrigramIndex(
      events.map((e) => ({
        id: e.id,
        text: JSON.stringify(e.payload ?? {}).toLowerCase(),
      }))
    );
  }

  search(filters: SearchFilters, options: SearchOptions = {}): MindEyeEvent<T>[] {
    let candidates = this.state.events;

    // if trigram + text query, filter candidates first by trigram hit
    if (options.useTrigram && filters.text && this.state.trigramIndex) {
      const hitIds = searchTrigramIndex(this.state.trigramIndex, filters.text);
      candidates = candidates.filter((e) => hitIds.has(e.id));
    }

    // basic filter pass
    const filtered = filterEvents(candidates, filters);

    // optional final text contains filter if text is provided
    if (filters.text) {
      const q = filters.text.toLowerCase();
      return filtered.filter((e) =>
        JSON.stringify(e.payload ?? {}).toLowerCase().includes(q)
      );
    }

    return filtered;
  }
}
