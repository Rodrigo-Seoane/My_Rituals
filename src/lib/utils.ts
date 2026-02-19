import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  startOfWeek,
  format,
  addDays,
  parseISO,
  isValid,
  isSameWeek,
} from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Returns the Monday of a given date as ISO string "YYYY-MM-DD" */
export function getMondayOf(date: Date = new Date()): string {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return format(monday, "yyyy-MM-dd");
}

/** Returns the Monday of the current week */
export function getCurrentMonday(): string {
  return getMondayOf(new Date());
}

/** Returns ISO date string for today */
export function getToday(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** Returns the 5 workdays (Mon–Fri) of a given week */
export function getWeekDays(mondayISO: string): string[] {
  const monday = parseISO(mondayISO);
  return Array.from({ length: 5 }, (_, i) =>
    format(addDays(monday, i), "yyyy-MM-dd")
  );
}

/** Formats an ISO date for display */
export function formatDate(isoDate: string, fmt = "MMM d, yyyy"): string {
  const d = parseISO(isoDate);
  return isValid(d) ? format(d, fmt) : isoDate;
}

/** Returns day name from ISO date */
export function getDayName(isoDate: string): string {
  const d = parseISO(isoDate);
  return isValid(d) ? format(d, "EEEE") : "";
}

/** Formats a week range for display: "Feb 16 – 20, 2026" */
export function formatWeekRange(mondayISO: string): string {
  const monday = parseISO(mondayISO);
  const friday = addDays(monday, 4);
  if (format(monday, "MMM yyyy") === format(friday, "MMM yyyy")) {
    return `${format(monday, "MMM d")} – ${format(friday, "d, yyyy")}`;
  }
  return `${format(monday, "MMM d")} – ${format(friday, "MMM d, yyyy")}`;
}

/** Check if a date is in the current week */
export function isCurrentWeek(isoDate: string): boolean {
  const d = parseISO(isoDate);
  return isValid(d) && isSameWeek(d, new Date(), { weekStartsOn: 1 });
}

/** Converts "HH:MM" to minutes since midnight */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Converts minutes since midnight to "HH:MM" */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Returns the height % for a time block in the week grid (09:00-20:00 = 660min) */
export function timeBlockToPercent(
  start: string,
  end: string,
  gridStart = "09:00",
  gridEnd = "20:00"
): { top: number; height: number } {
  const gs = timeToMinutes(gridStart);
  const ge = timeToMinutes(gridEnd);
  const total = ge - gs;
  const s = timeToMinutes(start) - gs;
  const e = timeToMinutes(end) - gs;
  return {
    top: (s / total) * 100,
    height: ((e - s) / total) * 100,
  };
}

/** Generate unique ID */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
