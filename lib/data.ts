import { supabase } from "./supabase";
import { WeeklyAgenda, DailyOps, WeeklyReview } from "./types";

// ─── Weekly Agenda ────────────────────────────────────────────────────────────

export async function getWeeklyAgenda(
  mondayISO: string
): Promise<WeeklyAgenda | null> {
  const { data, error } = await supabase
    .from("weekly_agendas")
    .select("data")
    .eq("week_of", mondayISO)
    .single();

  if (error || !data) return null;
  return data.data as WeeklyAgenda;
}

export async function saveWeeklyAgenda(agenda: WeeklyAgenda): Promise<void> {
  agenda.updatedAt = new Date().toISOString();

  const { error } = await supabase.from("weekly_agendas").upsert(
    {
      week_of: agenda.weekOf,
      data: agenda,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "week_of" }
  );

  if (error) throw error;
}

export async function listWeeklyAgendas(): Promise<string[]> {
  const { data, error } = await supabase
    .from("weekly_agendas")
    .select("week_of")
    .order("week_of", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => row.week_of);
}

// ─── Daily Ops ────────────────────────────────────────────────────────────────

export async function getDailyOps(dateISO: string): Promise<DailyOps | null> {
  const { data, error } = await supabase
    .from("daily_ops")
    .select("data")
    .eq("date", dateISO)
    .single();

  if (error || !data) return null;
  return data.data as DailyOps;
}

export async function saveDailyOps(ops: DailyOps): Promise<void> {
  ops.updatedAt = new Date().toISOString();

  const { error } = await supabase.from("daily_ops").upsert(
    {
      date: ops.date,
      data: ops,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "date" }
  );

  if (error) throw error;
}

export async function listDailyOps(): Promise<string[]> {
  const { data, error } = await supabase
    .from("daily_ops")
    .select("date")
    .order("date", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => row.date);
}

// ─── Weekly Reviews ───────────────────────────────────────────────────────────

export async function getWeeklyReview(
  mondayISO: string
): Promise<WeeklyReview | null> {
  const { data, error } = await supabase
    .from("weekly_reviews")
    .select("data")
    .eq("week_of", mondayISO)
    .single();

  if (error || !data) return null;
  return data.data as WeeklyReview;
}

export async function saveWeeklyReview(review: WeeklyReview): Promise<void> {
  review.updatedAt = new Date().toISOString();

  const { error } = await supabase.from("weekly_reviews").upsert(
    {
      week_of: review.weekOf,
      data: review,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "week_of" }
  );

  if (error) throw error;
}

export async function listWeeklyReviews(): Promise<string[]> {
  const { data, error } = await supabase
    .from("weekly_reviews")
    .select("week_of")
    .order("week_of", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => row.week_of);
}
