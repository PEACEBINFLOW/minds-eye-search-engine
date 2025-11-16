import express, { Request, Response } from "express";
import { InMemorySearchStore } from "./search/hunt";
import { SearchFilters } from "./search/filters";
import { countEventsPerDay } from "./stats/timelineStats";
import { MindEyeEvent } from "./types/events";

const app = express();
app.use(express.json());

const PORT = process.env.PORT ?? 3004;

// In-memory store for prototyping.
// In production, you would replace this with DB-backed loading.
const store = new InMemorySearchStore<any>();

// Simple health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "minds-eye-search-engine" });
});

// For prototyping: endpoint to load events into memory.
app.post("/events/load", (req: Request, res: Response) => {
  const events = req.body?.events as MindEyeEvent[] | undefined;
  if (!events || !Array.isArray(events)) {
    return res.status(400).json({ error: "events array is required" });
  }
  store.loadEvents(events);
  res.json({ loaded: events.length });
});

// GET /events/search?text=...&source=gmail&from=...&to=...
app.get("/events/search", (req: Request, res: Response) => {
  const { text, source, kind, from, to } = req.query;

  const filters: SearchFilters = {};

  if (text && typeof text === "string") {
    filters.text = text;
  }

  if (source && typeof source === "string") {
    filters.sources = source.split(",") as any;
  }

  if (kind && typeof kind === "string") {
    filters.kinds = kind.split(",");
  }

  if (from || to) {
    filters.timeRange = {};
    if (from && typeof from === "string") filters.timeRange.from = from;
    if (to && typeof to === "string") filters.timeRange.to = to;
  }

  const results = store.search(filters, { useTrigram: true });
  res.json({ count: results.length, results });
});

// GET /events/stats?from=...&to=...
app.get("/events/stats", (req: Request, res: Response) => {
  // For now, stats operate over all loaded events.
  // You could apply the same filters as /search later.
  // @ts-ignore - private access but fine for simple prototype
  const allEvents: MindEyeEvent[] = (store as any).state?.events ?? [];
  const daily = countEventsPerDay(allEvents);
  res.json({ daily });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Mind's Eye Search Engine listening on port ${PORT}`);
});
