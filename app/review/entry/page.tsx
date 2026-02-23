"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Trophy, AlertCircle, BookOpen, Compass } from "lucide-react";
import { WeeklyTask, CATEGORY_META } from "@/lib/types";
import { getCurrentMonday, formatWeekRange } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export default function WeeklyReviewPage() {
  const router = useRouter();
  const mondayISO = getCurrentMonday();

  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [accomplishments, setAccomplishments] = useState("");
  const [difficulties, setDifficulties] = useState("");
  const [learnings, setLearnings] = useState("");
  const [nextWeekFocus, setNextWeekFocus] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [agendaRes, reviewRes] = await Promise.all([
        fetch(`/api/weeks/${mondayISO}`),
        fetch(`/api/reviews/${mondayISO}`),
      ]);

      if (agendaRes.ok) {
        const agenda = await agendaRes.json();
        setTasks(agenda.tasks ?? []);
      }

      if (reviewRes.ok) {
        const review = await reviewRes.json();
        setAccomplishments(review.accomplishments ?? "");
        setDifficulties(review.difficulties ?? "");
        setLearnings(review.learnings ?? "");
        setNextWeekFocus(review.nextWeekFocus ?? "");
      }

      setLoading(false);
    }
    load();
  }, [mondayISO]);

  async function handleSave() {
    setSaving(true);
    try {
      const completedTaskIds = tasks
        .filter((t) => t.status === "done")
        .map((t) => t.id);

      await fetch(`/api/reviews/${mondayISO}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accomplishments,
          difficulties,
          learnings,
          nextWeekFocus,
          completedTaskIds,
        }),
      });
      router.push("/");
    } catch {
      alert("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const doneTasks = tasks.filter((t) => t.status === "done");
  const blockedTasks = tasks.filter((t) => t.status === "blocked");
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const totalHours = tasks.reduce((s, t) => s + t.estimatedHours, 0);
  const doneHours = doneTasks.reduce((s, t) => s + t.estimatedHours, 0);
  const completionPct = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#080D00]">Weekly Review</h1>
          <p className="text-[#686B63] mt-1">{formatWeekRange(mondayISO)}</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save review"}
        </Button>
      </div>

      {/* Week stats */}
      {tasks.length > 0 && (
        <Card className="bg-[#421E06] text-white border-0">
          <CardContent className="pt-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
              <div>
                <p className="text-xs text-[#C7C8C6] opacity-70 uppercase tracking-wider">Completion</p>
                <p className="text-2xl font-heading font-bold text-[#FFD115] mt-0.5">{completionPct}%</p>
              </div>
              <div>
                <p className="text-xs text-[#C7C8C6] opacity-70 uppercase tracking-wider">Tasks done</p>
                <p className="text-2xl font-heading font-bold mt-0.5">
                  {doneTasks.length}<span className="text-sm text-[#C7C8C6] font-normal">/{tasks.length}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#C7C8C6] opacity-70 uppercase tracking-wider">Hours done</p>
                <p className="text-2xl font-heading font-bold mt-0.5">
                  {doneHours}h<span className="text-sm text-[#C7C8C6] font-normal">/{totalHours}h</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#C7C8C6] opacity-70 uppercase tracking-wider">Blocked</p>
                <p className="text-2xl font-heading font-bold mt-0.5 text-amber-400">{blockedTasks.length}</p>
              </div>
            </div>
            <Progress value={completionPct} className="bg-[#5a2a08]" />
          </CardContent>
        </Card>
      )}

      {/* Completed tasks */}
      {doneTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#3D6B4F]" />
              Completed this week
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1.5">
            {doneTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <span className="text-[#3D6B4F] text-sm">✓</span>
                <span className="text-sm text-[#080D00] flex-1">{t.title}</span>
                <CategoryBadge category={t.category} />
                <span className="text-xs text-[#686B63]">{t.estimatedHours}h</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Unfinished / blocked */}
      {(blockedTasks.length > 0 || pendingTasks.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Unfinished / carry forward
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1.5">
            {[...blockedTasks, ...pendingTasks].map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <span
                  className="text-sm"
                  style={{ color: t.status === "blocked" ? "#EF4444" : "#C7C8C6" }}
                >
                  {t.status === "blocked" ? "⚠" : "○"}
                </span>
                <span className="text-sm text-[#080D00] flex-1">{t.title}</span>
                <CategoryBadge category={t.category} />
                <span className="text-xs text-[#686B63]">{t.estimatedHours}h</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Reflection questions */}
      <div className="space-y-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-[#FFD115]" />
              Accomplishments
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Textarea
              placeholder="What are you most proud of this week? What moved forward?"
              className="min-h-[100px]"
              value={accomplishments}
              onChange={(e) => setAccomplishments(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Difficulties
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Textarea
              placeholder="What felt hard? What got in the way? Where did you lose energy?"
              className="min-h-[100px]"
              value={difficulties}
              onChange={(e) => setDifficulties(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-[#3D6B4F]" />
              Learnings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Textarea
              placeholder="What did you learn — about your work, your process, or yourself?"
              className="min-h-[100px]"
              value={learnings}
              onChange={(e) => setLearnings(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Compass className="h-4 w-4 text-[#421E06]" />
              Focus for next week
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Textarea
              placeholder="What one thing, if done well, would make next week feel like a success?"
              className="min-h-[80px]"
              value={nextWeekFocus}
              onChange={(e) => setNextWeekFocus(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg" className="w-full sm:w-auto">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save review"}
        </Button>
      </div>
    </div>
  );
}
