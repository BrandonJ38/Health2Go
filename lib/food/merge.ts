import type { LogEntry } from './types';

// `deleted` remembers removed entry ids so a deletion on one device isn't undone by another device's copy.
export type FoodLogData = { entries: LogEntry[]; deleted: string[]; updatedAt: number };

// Union of both copies by entry id, minus anything deleted on either side.
export function mergeFoodLogs(a: FoodLogData, b: FoodLogData): FoodLogData {
  const deleted = [...new Set([...a.deleted, ...b.deleted])];
  const gone = new Set(deleted);
  const byId = new Map<string, LogEntry>();
  for (const e of [...a.entries, ...b.entries]) if (!gone.has(e.id)) byId.set(e.id, e);
  return { entries: [...byId.values()].sort((x, y) => x.createdAt - y.createdAt), deleted, updatedAt: Math.max(a.updatedAt, b.updatedAt) };
}
