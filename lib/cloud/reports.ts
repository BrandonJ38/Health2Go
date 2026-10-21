// User restaurant reports ("they cook in olive oil ✅ / they use canola ❌").
import type { CriterionKey } from '../nearby/types';
import { getSupabase } from './supabase';

export type Tally = { yes: number; no: number };
export type PlaceTallies = Partial<Record<CriterionKey, Tally>>;
export type MyVotes = Partial<Record<CriterionKey, boolean>>;

// 2+ matching reports, with more yes than no → "Confirmed by users" (kept separate from "Verified").
export const MIN_CONFIRMATIONS = 2;
export const isConfirmed = (t?: Tally) => !!t && t.yes >= MIN_CONFIRMATIONS && t.yes > t.no;
export const isDisputed = (t?: Tally) => !!t && t.no >= MIN_CONFIRMATIONS && t.no > t.yes;

type Row = { place_id: string; criterion: CriterionKey; value: boolean; user_id: string };

export async function fetchReports(placeIds: string[], userId: string | null) {
  const tallies = new Map<string, PlaceTallies>();
  const mine = new Map<string, MyVotes>();
  const supabase = getSupabase();
  if (!supabase || !placeIds.length) return { tallies, mine };

  const { data, error } = await supabase.from('restaurant_reports').select('place_id, criterion, value, user_id').in('place_id', placeIds);
  if (error) throw error;
  for (const r of (data ?? []) as Row[]) {
    const place = tallies.get(r.place_id) ?? {};
    const t = (place[r.criterion] ??= { yes: 0, no: 0 });
    if (r.value) t.yes++;
    else t.no++;
    tallies.set(r.place_id, place);
    if (userId && r.user_id === userId) mine.set(r.place_id, { ...mine.get(r.place_id), [r.criterion]: r.value });
  }
  return { tallies, mine };
}

export async function submitReport(placeId: string, placeName: string, criterion: CriterionKey, value: boolean, userId: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Accounts are not set up yet.');
  const { error } = await supabase
    .from('restaurant_reports')
    .upsert(
      { place_id: placeId, place_name: placeName, criterion, value, user_id: userId, updated_at: new Date().toISOString() },
      { onConflict: 'place_id,user_id,criterion' },
    );
  if (error) throw error;
}
