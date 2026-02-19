import { NextResponse } from "next/server";
import {
  listWeeklyAgendas,
  listDailyOps,
  listWeeklyReviews,
  getWeeklyAgenda,
  getWeeklyReview,
} from "@/lib/data";
import { CATEGORY_META } from "@/lib/types";

export async function GET() {
  const [weekDates, dailyDates, reviewDates] = await Promise.all([
    listWeeklyAgendas(),
    listDailyOps(),
    listWeeklyReviews(),
  ]);

  const weeks = await Promise.all(
    weekDates.map(async (mondayISO) => {
      const agenda = await getWeeklyAgenda(mondayISO);
      const review = await getWeeklyReview(mondayISO);
      const tasks = agenda?.tasks ?? [];
      const totalHours = tasks.reduce((s, t) => s + t.estimatedHours, 0);
      const doneCount = tasks.filter((t) => t.status === "done").length;
      const categoryBreakdown = Object.fromEntries(
        Object.keys(CATEGORY_META).map((cat) => [
          cat,
          tasks.filter((t) => t.category === cat).reduce((s, t) => s + t.estimatedHours, 0),
        ])
      );
      return {
        mondayISO,
        totalHours,
        taskCount: tasks.length,
        doneCount,
        hasReview: !!review,
        categoryBreakdown,
        dailyEntries: dailyDates.filter((d) => {
          const [y, m] = d.split("-");
          const [wy, wm] = mondayISO.split("-");
          // rough match: same year-week
          return d >= mondayISO && d <= mondayISO.replace(/\d{2}$/, "").concat("19");
        }),
      };
    })
  );

  return NextResponse.json({ weeks, dailyDates, reviewDates });
}
