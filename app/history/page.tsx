import Link from "next/link";
import {
  listWeeklyAgendas,
  getWeeklyAgenda,
  getWeeklyReview,
} from "@/lib/data";
import {
  formatWeekRange,
  formatDate,
  isCurrentWeek,
} from "@/lib/utils";
import { CATEGORY_META } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle2, Clock, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const weekDates = await listWeeklyAgendas();

  const weeks = await Promise.all(
    weekDates.map(async (mondayISO) => {
      const [agenda, review] = await Promise.all([
        getWeeklyAgenda(mondayISO),
        getWeeklyReview(mondayISO),
      ]);
      const tasks = agenda?.tasks ?? [];
      const totalHours = tasks.reduce((s, t) => s + t.estimatedHours, 0);
      const doneTasks = tasks.filter((t) => t.status === "done").length;
      const completionPct =
        tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

      const categoryHours = Object.fromEntries(
        Object.keys(CATEGORY_META).map((cat) => [
          cat,
          tasks
            .filter((t) => t.category === cat)
            .reduce((s, t) => s + t.estimatedHours, 0),
        ])
      );

      return {
        mondayISO,
        tasks,
        totalHours,
        doneTasks,
        taskCount: tasks.length,
        completionPct,
        categoryHours,
        review,
        isCurrent: isCurrentWeek(mondayISO),
      };
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#080D00]">History</h1>
        <p className="text-[#686B63] mt-1">
          {weeks.length} week{weeks.length !== 1 ? "s" : ""} documented
        </p>
      </div>

      {weeks.length === 0 ? (
        <Card className="border-dashed border-2 border-[#C7C8C6]">
          <CardContent className="py-16 flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#FFF9D6] flex items-center justify-center">
              <Clock className="h-6 w-6 text-[#421E06]" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-semibold text-[#080D00]">
                No history yet
              </h2>
              <p className="text-[#686B63] text-sm mt-1">
                Start planning your weeks and they'll appear here.
              </p>
            </div>
            <Link
              href="/week/entry"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#FFD115] text-[#421E06] font-semibold text-sm hover:bg-[#f0c400] transition-colors"
            >
              Plan this week <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {weeks.map((week) => (
            <Card
              key={week.mondayISO}
              className={week.isCurrent ? "border-[#FFD115] bg-[#FFFEF5]" : undefined}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">
                        {formatWeekRange(week.mondayISO)}
                      </CardTitle>
                      {week.isCurrent && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFD115] text-[#421E06] font-semibold">
                          Current
                        </span>
                      )}
                      {week.review && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#E4F0E9] text-[#3D6B4F] font-medium flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Reviewed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#686B63] mt-0.5">
                      {week.taskCount} tasks · {week.totalHours}h planned
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xl font-heading font-bold text-[#080D00]">
                        {week.completionPct}%
                      </p>
                      <p className="text-xs text-[#686B63]">
                        {week.doneTasks}/{week.taskCount} done
                      </p>
                    </div>
                    <Link
                      href={week.isCurrent ? "/" : `#`}
                      className="text-[#686B63] hover:text-[#421E06] transition-colors p-1.5 rounded-md hover:bg-[#F7F7F7]"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <Progress value={week.completionPct} className="mb-4" />

                {/* Category breakdown */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(CATEGORY_META)
                    .filter(([key]) => (week.categoryHours[key] ?? 0) > 0)
                    .map(([key, meta]) => (
                      <div
                        key={key}
                        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"
                        style={{ backgroundColor: meta.bg, color: meta.text }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: meta.color }}
                        />
                        <span>{meta.label}</span>
                        <span className="opacity-60">{week.categoryHours[key]}h</span>
                      </div>
                    ))}
                </div>

                {/* Review excerpt */}
                {week.review?.accomplishments && (
                  <div className="mt-4 pt-4 border-t border-[#F7F7F7]">
                    <p className="text-xs font-medium text-[#686B63] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-[#3D6B4F]" />
                      Accomplishments
                    </p>
                    <p className="text-sm text-[#080D00] line-clamp-2">
                      {week.review.accomplishments}
                    </p>
                  </div>
                )}

                {week.review?.learnings && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-[#686B63] uppercase tracking-wider mb-1">
                      Key learning
                    </p>
                    <p className="text-sm text-[#080D00] line-clamp-1">
                      {week.review.learnings}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
