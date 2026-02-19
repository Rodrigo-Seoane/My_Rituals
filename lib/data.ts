import { promises as fs } from "fs";
import path from "path";
import { WeeklyAgenda, DailyOps, WeeklyReview } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const WEEKS_DIR = path.join(DATA_DIR, "weeks");
const DAILY_DIR = path.join(DATA_DIR, "daily");
const REVIEWS_DIR = path.join(DATA_DIR, "reviews");

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

// ─── Weekly Agenda ────────────────────────────────────────────────────────────

export async function getWeeklyAgenda(
  mondayISO: string
): Promise<WeeklyAgenda | null> {
  await ensureDir(WEEKS_DIR);
  const file = path.join(WEEKS_DIR, `${mondayISO}.json`);
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as WeeklyAgenda;
  } catch {
    return null;
  }
}

export async function saveWeeklyAgenda(agenda: WeeklyAgenda): Promise<void> {
  await ensureDir(WEEKS_DIR);
  const file = path.join(WEEKS_DIR, `${agenda.weekOf}.json`);
  agenda.updatedAt = new Date().toISOString();
  await fs.writeFile(file, JSON.stringify(agenda, null, 2));
}

export async function listWeeklyAgendas(): Promise<string[]> {
  await ensureDir(WEEKS_DIR);
  const files = await fs.readdir(WEEKS_DIR);
  return files
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))
    .sort()
    .reverse();
}

// ─── Daily Ops ────────────────────────────────────────────────────────────────

export async function getDailyOps(dateISO: string): Promise<DailyOps | null> {
  await ensureDir(DAILY_DIR);
  const file = path.join(DAILY_DIR, `${dateISO}.json`);
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as DailyOps;
  } catch {
    return null;
  }
}

export async function saveDailyOps(ops: DailyOps): Promise<void> {
  await ensureDir(DAILY_DIR);
  const file = path.join(DAILY_DIR, `${ops.date}.json`);
  ops.updatedAt = new Date().toISOString();
  await fs.writeFile(file, JSON.stringify(ops, null, 2));
}

export async function listDailyOps(): Promise<string[]> {
  await ensureDir(DAILY_DIR);
  const files = await fs.readdir(DAILY_DIR);
  return files
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))
    .sort()
    .reverse();
}

// ─── Weekly Reviews ───────────────────────────────────────────────────────────

export async function getWeeklyReview(
  mondayISO: string
): Promise<WeeklyReview | null> {
  await ensureDir(REVIEWS_DIR);
  const file = path.join(REVIEWS_DIR, `${mondayISO}.json`);
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as WeeklyReview;
  } catch {
    return null;
  }
}

export async function saveWeeklyReview(review: WeeklyReview): Promise<void> {
  await ensureDir(REVIEWS_DIR);
  const file = path.join(REVIEWS_DIR, `${review.weekOf}.json`);
  review.updatedAt = new Date().toISOString();
  await fs.writeFile(file, JSON.stringify(review, null, 2));
}

export async function listWeeklyReviews(): Promise<string[]> {
  await ensureDir(REVIEWS_DIR);
  const files = await fs.readdir(REVIEWS_DIR);
  return files
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))
    .sort()
    .reverse();
}
