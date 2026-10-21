import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { FoodLogData } from './merge';
import type { LogEntry, Nutrients } from './types';

export { mergeFoodLogs, type FoodLogData } from './merge';

// Saved on the device; synced to the user's account when signed in (lib/cloud/CloudSync.tsx).
const STORAGE_KEY = 'foodlog:v1';


const EMPTY: FoodLogData = { entries: [], deleted: [], updatedAt: 0 };

type FoodLogValue = {
  entries: LogEntry[];
  data: FoodLogData;
  loaded: boolean;
  add: (entry: Omit<LogEntry, 'id' | 'createdAt'>) => void;
  remove: (id: string) => void;
  replace: (data: FoodLogData) => void;
  forDate: (date: string) => LogEntry[];
  recent: (limit?: number) => LogEntry[]; // distinct foods, newest first — for quick re-logging
};

const FoodLogContext = createContext<FoodLogValue | null>(null);

export function FoodLogProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FoodLogData>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as LogEntry[] | FoodLogData;
        // Older versions saved a plain array of entries.
        setData(Array.isArray(parsed) ? { ...EMPTY, entries: parsed } : { ...EMPTY, ...parsed });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const save = useCallback((next: FoodLogData) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
    return next;
  }, []);

  const add = useCallback<FoodLogValue['add']>(
    (entry) =>
      setData((prev) =>
        save({
          ...prev,
          entries: [...prev.entries, { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: Date.now() }],
          updatedAt: Date.now(),
        }),
      ),
    [save],
  );

  const remove = useCallback(
    (id: string) =>
      setData((prev) => save({ entries: prev.entries.filter((e) => e.id !== id), deleted: [...prev.deleted, id], updatedAt: Date.now() })),
    [save],
  );

  const replace = useCallback((next: FoodLogData) => setData(save(next)), [save]);

  const entries = data.entries;
  const forDate = useCallback((date: string) => entries.filter((e) => e.date === date), [entries]);

  const recent = useCallback(
    (limit = 8) => {
      const seen = new Set<string>();
      return [...entries]
        .sort((a, b) => b.createdAt - a.createdAt)
        .filter((e) => {
          const key = `${e.name}|${e.brand ?? ''}|${e.amountLabel ?? ''}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, limit);
    },
    [entries],
  );

  const value = useMemo(
    () => ({ entries, data, loaded, add, remove, replace, forDate, recent }),
    [entries, data, loaded, add, remove, replace, forDate, recent],
  );
  return <FoodLogContext.Provider value={value}>{children}</FoodLogContext.Provider>;
}

export function useFoodLog(): FoodLogValue {
  const ctx = useContext(FoodLogContext);
  if (!ctx) throw new Error('useFoodLog must be used inside <FoodLogProvider>');
  return ctx;
}

export function sumNutrients(list: { nutrients: Nutrients }[]): Nutrients {
  return list.reduce(
    (t, e) => ({
      kcal: t.kcal + e.nutrients.kcal,
      protein: t.protein + e.nutrients.protein,
      carbs: t.carbs + e.nutrients.carbs,
      fat: t.fat + e.nutrients.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}
