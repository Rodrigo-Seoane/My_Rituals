import Link from "next/link";
import { getWeeklyAgenda, getDailyOps, getWeeklyReview } from "@/lib/data";
import { getCurrentMonday, getToday, formatWeekRange, formatDate, getDayName } from "@/lib/utils";
import { CATEGORY_META } from "@/lib/types";
import { WeekGrid } from "@/components/WeekGrid";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarPlus, ClipboardCheck, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const mondayISO = getCurrentMonday();
  const todayISO = getToday();

  const [agenda, todayOps, review] = await Promise.all([
    getWeeklyAgenda(mondayISO),
    getDailyOps(todayISO),
    getWeeklyReview(mondayISO),
  ]);

  const tasks = agenda?.tasks ?? [];
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const totalEstimatedHours = tasks.reduce((s, t) => s + t.estimatedHours, 0);
  const completionPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const categoryBreakdown = Object.entries(CATEGORY_META).map(([key, meta]) => {
    const catTasks = tasks.filter((t) => t.category === key);
    const hours = catTasks.reduce((s, t) => s + t.estimatedHours, 0);
    const done = catTasks.filter((t) => t.status === "done").length;
    return { key, meta, hours, count: catTasks.length, done };
  }).filter((c) => c.count > 0);

  const blockedTasks = tasks.filter((t) => t.status === "blocked");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#080D00]">
            Week of {formatWeekRange(mondayISO)}
          </h1>
          <p className="text-[#686B63] mt-1">
            {getDayName(todayISO)}, {formatDate(todayISO, "MMMM d")}
          </p>
        </div>
        <div className="flex gap-2">
          {!agenda && (
            <Link href="/week/entry">
              <Button>
                <CalendarPlus className="h-4 w-4" />
                Plan this week
              </Button>
            </Link>
          )}
          <Link href="/daily/entry">
            <Button variant={todayOps ? "outline" : "default"}>
              <ClipboardCheck className="h-4 w-4" />
              {todayOps ? "Edit today's ops" : "Daily check-in"}
            </Button>
          </Link>
        </div>
      </div>

      {!agenda ? (
        /* Empty state */
        <Card className="border-dashed border-2 border-[#C7C8C6]">
          <CardContent className="py-16 flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#FFF9D6] flex items-center justify-center">
              <CalendarPlus className="h-6 w-6 text-[#421E06]" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-semibold text-[#080D00]">
                No plan for this week yet
              </h2>
              <p className="text-[#686B63] text-sm mt-1 max-w-sm">
                Start by adding your weekly agenda. Tasks will be auto-distributed into your calendar.
              </p>
            </div>
            <Link href="/week/entry">
              <Button>Plan this week <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs font-medium text-[#686B63] uppercase tracking-wider">Progress</p>
                <p className="text-3xl font-heading font-bold text-[#080D00] mt-1">{completionPct}%</p>
                <Progress value={completionPct} className="mt-2" />
                <p className="text-xs text-[#686B63] mt-1">{doneTasks}/{totalTasks} tasks done</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs font-medium text-[#686B63] uppercase tracking-wider">Hours planned</p>
                <p className="text-3xl font-heading font-bold text-[#080D00] mt-1">{totalEstimatedHours}h</p>
                <p className="text-xs text-[#686B63] mt-3">{totalTasks} tasks this week</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs font-medium text-[#686B63] uppercase tracking-wider">Today</p>
                <p className="text-3xl font-heading font-bold text-[#080D00] mt-1">
                  {todayOps ? "✓" : "—"}
                </p>
                <p className="text-xs text-[#686B63] mt-3">
                  {todayOps ? "Daily ops submitted" : "No check-in yet"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs font-medium text-[#686B63] uppercase tracking-wider">Blockers</p>
                <p className="text-3xl font-heading font-bold text-[#080D00] mt-1">{blockedTasks.length}</p>
                <p className="text-xs text-[#686B63] mt-3">
                  {blockedTasks.length === 0 ? "All clear" : "Need attention"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Week grid */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Week Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <WeekGrid mondayISO={mondayISO} tasks={tasks} />
            </CardContent>
          </Card>

          {/* Two-column: tasks list + today's ops */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Task list */}
            <div className="lg:col-span-2 space-y-3">
              <h2 className="font-heading text-lg font-semibold text-[#080D00]">All tasks</h2>
              {categoryBreakdown.map(({ key, meta, hours, count, done }) => (
                <Card key={key}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: meta.color }}
                        />
                        <span className="font-medium text-sm font-heading">{meta.label}</span>
                      </div>
                      <span className="text-xs text-[#686B63]">
                        {done}/{count} · {hours}h
                      </span>
                    </div>
                    <div className="space-y-1">
                      {tasks
                        .filter((t) => t.category === key)
                        .map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-2 py-1 px-2 rounded"
                            style={{
                              backgroundColor:
                                task.status === "done" ? "#F7F7F7" : meta.bg,
                              opacity: task.status === "done" ? 0.6 : 1,
                            }}
                          >
                            <span className="text-xs flex-1 truncate">{task.title}</span>
                            <span className="text-xs text-[#686B63] flex-shrink-0">
                              {task.estimatedHours}h
                            </span>
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor:
                                  task.status === "done"
                                    ? "#E4F0E9"
                                    : task.status === "blocked"
                                    ? "#FEE2E2"
                                    : task.status === "in-progress"
                                    ? "#FFF9D6"
                                    : "#F7F7F7",
                                color:
                                  task.status === "done"
                                    ? "#3D6B4F"
                                    : task.status === "blocked"
                                    ? "#EF4444"
                                    : task.status === "in-progress"
                                    ? "#421E06"
                                    : "#686B63",
                              }}
                            >
                              {task.status}
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Today's ops */}
            <div className="space-y-3">
              <h2 className="font-heading text-lg font-semibold text-[#080D00]">Today</h2>
              {todayOps ? (
                <>
                  <Card>
                    <CardContent className="py-4 px-4 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-[#686B63] uppercase tracking-wider mb-1">
                          Yesterday
                        </p>
                        <p className="text-sm text-[#080D00]">{todayOps.yesterday || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#686B63] uppercase tracking-wider mb-1">
                          Today's focus
                        </p>
                        <p className="text-sm text-[#080D00]">{todayOps.today || "—"}</p>
                      </div>
                      {todayOps.blockers && (
                        <div>
                          <p className="text-xs font-medium text-red-500 uppercase tracking-wider mb-1">
                            Blockers
                          </p>
                          <p className="text-sm text-[#080D00]">{todayOps.blockers}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs text-[#686B63]">Energy:</span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor:
                              todayOps.energy === "high"
                                ? "#E4F0E9"
                                : todayOps.energy === "low"
                                ? "#FEE2E2"
                                : "#FFF9D6",
                            color:
                              todayOps.energy === "high"
                                ? "#3D6B4F"
                                : todayOps.energy === "low"
                                ? "#EF4444"
                                : "#421E06",
                          }}
                        >
                          {todayOps.energy}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Task updates */}
                  {todayOps.taskUpdates?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Task updates today</CardTitle>
                      </CardHeader>
                      <CardContent className="py-0 pb-3">
                        <div className="space-y-1.5">
                          {todayOps.taskUpdates.map((u) => {
                            const task = tasks.find((t) => t.id === u.taskId);
                            if (!task) return null;
                            return (
                              <div key={u.taskId} className="flex items-start gap-2">
                                <span
                                  className="h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0"
                                  style={{ backgroundColor: CATEGORY_META[task.category].color }}
                                />
                                <div>
                                  <p className="text-xs font-medium text-[#080D00]">{task.title}</p>
                                  {u.note && <p className="text-xs text-[#686B63]">{u.note}</p>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="border-dashed border-[#C7C8C6]">
                  <CardContent className="py-8 flex flex-col items-center text-center gap-3">
                    <p className="text-sm text-[#686B63]">No check-in yet for today</p>
                    <Link href="/daily/entry">
                      <Button size="sm">Check in now</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Week review prompt */}
              {!review && (
                <Card className="border-[#FFD115] bg-[#FFFEF5]">
                  <CardContent className="py-4 px-4">
                    <p className="text-sm font-medium text-[#421E06]">
                      Ready to review this week?
                    </p>
                    <p className="text-xs text-[#686B63] mt-1">
                      Capture learnings and accomplishments before the week ends.
                    </p>
                    <Link href="/review/entry" className="inline-block mt-3">
                      <Button size="sm" variant="outline">
                        Write review <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
