"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Zap, Calendar } from "lucide-react";
import { WeeklyTask, TaskStatus, CATEGORY_META, DailyTaskUpdate } from "@/lib/types";
import { getToday, getMondayOf, formatDate, getDayName, getCurrentMonday } from "@/lib/utils";
import { parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Energy = "high" | "medium" | "low";

const ENERGY_OPTIONS: { value: Energy; label: string; color: string; bg: string }[] = [
  { value: "high", label: "High", color: "#3D6B4F", bg: "#E4F0E9" },
  { value: "medium", label: "Medium", color: "#421E06", bg: "#FFF9D6" },
  { value: "low", label: "Low", color: "#EF4444", bg: "#FEE2E2" },
];

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In progress" },
  { value: "done", label: "Done ✓" },
  { value: "blocked", label: "Blocked ⚠" },
];

export default function DailyOpsPage() {
  const router = useRouter();
  const todayISO = getToday();
  const mondayISO = getMondayOf(parseISO(todayISO));

  const [weekTasks, setWeekTasks] = useState<WeeklyTask[]>([]);
  const [yesterday, setYesterday] = useState("");
  const [today, setToday] = useState("");
  const [blockers, setBlockers] = useState("");
  const [energy, setEnergy] = useState<Energy>("medium");
  const [taskUpdates, setTaskUpdates] = useState<Record<string, { status: TaskStatus; note: string }>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [agendaRes, opsRes] = await Promise.all([
        fetch(`/api/weeks/${mondayISO}`),
        fetch(`/api/daily/${todayISO}`),
      ]);

      if (agendaRes.ok) {
        const agenda = await agendaRes.json();
        setWeekTasks(agenda.tasks ?? []);
        // Pre-populate task updates from current task statuses
        const initial: Record<string, { status: TaskStatus; note: string }> = {};
        for (const t of agenda.tasks ?? []) {
          initial[t.id] = { status: t.status, note: "" };
        }
        setTaskUpdates(initial);
      }

      if (opsRes.ok) {
        const ops = await opsRes.json();
        setYesterday(ops.yesterday ?? "");
        setToday(ops.today ?? "");
        setBlockers(ops.blockers ?? "");
        setEnergy(ops.energy ?? "medium");
        // Restore saved task updates
        const savedUpdates: Record<string, { status: TaskStatus; note: string }> = {};
        for (const u of ops.taskUpdates ?? []) {
          savedUpdates[u.taskId] = { status: u.status, note: u.note };
        }
        setTaskUpdates((prev) => ({ ...prev, ...savedUpdates }));
      }

      setLoading(false);
    }
    load();
  }, [todayISO, mondayISO]);

  function updateTaskStatus(taskId: string, status: TaskStatus) {
    setTaskUpdates((prev) => ({
      ...prev,
      [taskId]: { ...prev[taskId], status },
    }));
  }

  function updateTaskNote(taskId: string, note: string) {
    setTaskUpdates((prev) => ({
      ...prev,
      [taskId]: { ...prev[taskId], note },
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updates: DailyTaskUpdate[] = Object.entries(taskUpdates).map(([taskId, u]) => ({
        taskId,
        status: u.status,
        note: u.note,
      }));

      // Save daily ops
      await fetch(`/api/daily/${todayISO}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yesterday, today, blockers, energy, taskUpdates: updates }),
      });

      // Propagate status changes back to the weekly agenda
      if (weekTasks.length > 0) {
        const updatedTasks = weekTasks.map((t) => {
          const u = taskUpdates[t.id];
          return u ? { ...t, status: u.status } : t;
        });
        await fetch(`/api/weeks/${mondayISO}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasks: updatedTasks }),
        });
      }

      router.push("/");
    } catch {
      alert("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-[#686B63]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[#080D00]">Daily Check-in</h1>
          <p className="text-[#686B63] mt-1 flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {getDayName(todayISO)}, {formatDate(todayISO, "MMMM d, yyyy")}
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save check-in"}
        </Button>
      </div>

      {/* Energy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#FFD115]" />
            Energy level
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          {ENERGY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setEnergy(opt.value)}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all",
                energy === opt.value
                  ? "border-transparent"
                  : "border-transparent bg-[#F7F7F7] text-[#686B63] hover:bg-[#EBEBEA]"
              )}
              style={
                energy === opt.value
                  ? { backgroundColor: opt.bg, color: opt.color, borderColor: opt.color }
                  : undefined
              }
            >
              {opt.label}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Standup questions */}
      <Card>
        <CardContent className="pt-5 space-y-5">
          <div>
            <Label htmlFor="yesterday">What did you accomplish yesterday?</Label>
            <Textarea
              id="yesterday"
              className="mt-2 min-h-[90px]"
              placeholder="Finished the wireframes for the checkout flow, reviewed PR feedback…"
              value={yesterday}
              onChange={(e) => setYesterday(e.target.value)}
            />
          </div>
          <Separator />
          <div>
            <Label htmlFor="today">What's your focus for today?</Label>
            <Textarea
              id="today"
              className="mt-2 min-h-[90px]"
              placeholder="Kick off the design sprint, sync with product on priorities…"
              value={today}
              onChange={(e) => setToday(e.target.value)}
            />
          </div>
          <Separator />
          <div>
            <Label htmlFor="blockers">Any blockers?</Label>
            <Textarea
              id="blockers"
              className="mt-2 min-h-[64px]"
              placeholder="Waiting on final copy from marketing before I can finish…"
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Task status updates */}
      {weekTasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-semibold text-[#080D00]">Task updates</h2>
          <p className="text-sm text-[#686B63] -mt-1">
            Mark which tasks you worked on or completed today.
          </p>
          {weekTasks.map((task) => {
            const update = taskUpdates[task.id] ?? { status: task.status, note: "" };
            const meta = CATEGORY_META[task.category];
            return (
              <Card
                key={task.id}
                className="overflow-hidden"
                style={{ borderLeftColor: meta.color, borderLeftWidth: "3px" }}
              >
                <CardContent className="py-3 px-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-[#080D00]">{task.title}</p>
                        <CategoryBadge category={task.category} />
                        <span className="text-xs text-[#686B63]">{task.estimatedHours}h</span>
                      </div>
                      {/* Status selector */}
                      <div className="mt-2">
                        <div className="flex gap-1.5 flex-wrap">
                          {STATUS_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => updateTaskStatus(task.id, opt.value)}
                              className={cn(
                                "px-2.5 py-1 rounded-full text-xs font-medium transition-all border",
                                update.status === opt.value
                                  ? opt.value === "done"
                                    ? "bg-[#E4F0E9] text-[#3D6B4F] border-[#3D6B4F]"
                                    : opt.value === "blocked"
                                    ? "bg-[#FEE2E2] text-red-600 border-red-400"
                                    : opt.value === "in-progress"
                                    ? "bg-[#FFF9D6] text-[#421E06] border-[#FFD115]"
                                    : "bg-[#EBEBEA] text-[#686B63] border-[#C7C8C6]"
                                  : "bg-white text-[#C7C8C6] border-[#EBEBEA] hover:border-[#C7C8C6]"
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Note */}
                      <input
                        className="mt-2 w-full text-xs text-[#686B63] placeholder:text-[#C7C8C6] bg-transparent border-0 border-b border-dashed border-[#EBEBEA] focus:outline-none focus:border-[#FFD115] pb-0.5"
                        placeholder="Add a quick note about this task…"
                        value={update.note}
                        onChange={(e) => updateTaskNote(task.id, e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {weekTasks.length === 0 && (
        <Card className="border-dashed border-[#C7C8C6]">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-[#686B63]">
              No weekly plan found for this week.{" "}
              <a href="/week/entry" className="text-[#421E06] underline">
                Add your weekly plan first.
              </a>
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save check-in"}
        </Button>
      </div>
    </div>
  );
}
