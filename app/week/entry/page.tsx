"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Trash2, ChevronDown, ChevronUp, Calendar, Clock, Users, AlertTriangle, Save, Loader2,
} from "lucide-react";
import { WeeklyTask, TaskCategory, TaskStatus, CATEGORY_META } from "@/lib/types";
import { getCurrentMonday, formatWeekRange, generateId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Separator } from "@/components/ui/separator";

const CATEGORIES = Object.entries(CATEGORY_META) as [TaskCategory, (typeof CATEGORY_META)[TaskCategory]][];

function emptyTask(): WeeklyTask {
  return {
    id: generateId(),
    title: "",
    category: "creation",
    estimatedHours: 1,
    stakeholders: [],
    blocks: "",
    requestedBy: "",
    notes: "",
    status: "pending",
  };
}

export default function WeeklyEntryPage() {
  const router = useRouter();
  const mondayISO = getCurrentMonday();
  const [tasks, setTasks] = useState<WeeklyTask[]>([emptyTask()]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ [tasks[0].id]: true });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/weeks/${mondayISO}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.tasks?.length) {
          setTasks(data.tasks);
          setExpanded({ [data.tasks[0].id]: true });
        }
      })
      .finally(() => setLoading(false));
  }, [mondayISO]);

  function updateTask(id: string, patch: Partial<WeeklyTask>) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function addTask() {
    const t = emptyTask();
    setTasks((prev) => [...prev, t]);
    setExpanded((prev) => ({ ...prev, [t.id]: true }));
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function parseStakeholders(raw: string): string[] {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function handleSave() {
    const invalid = tasks.some((t) => !t.title.trim());
    if (invalid) {
      alert("Please give every task a title.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/weeks/${mondayISO}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks }),
      });
      if (!res.ok) throw new Error("Save failed");
      router.push("/");
    } catch (e) {
      alert("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const totalHours = tasks.reduce((s, t) => s + (Number(t.estimatedHours) || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-[#686B63]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[#080D00]">Weekly Plan</h1>
          <p className="text-[#686B63] mt-1 flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatWeekRange(mondayISO)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-heading font-bold text-[#080D00]">{totalHours}h</p>
            <p className="text-xs text-[#686B63]">{tasks.length} tasks planned</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "Save & schedule"}
          </Button>
        </div>
      </div>

      {/* Category summary */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(([key, meta]) => {
          const catTasks = tasks.filter((t) => t.category === key);
          if (catTasks.length === 0) return null;
          const hrs = catTasks.reduce((s, t) => s + (Number(t.estimatedHours) || 0), 0);
          return (
            <div
              key={key}
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: meta.bg, color: meta.text }}
            >
              <span>{meta.label}</span>
              <span className="opacity-60">· {catTasks.length} task{catTasks.length > 1 ? "s" : ""} · {hrs}h</span>
            </div>
          );
        })}
      </div>

      <Separator />

      {/* Tasks */}
      <div className="space-y-3">
        {tasks.map((task, idx) => {
          const isOpen = !!expanded[task.id];
          const meta = CATEGORY_META[task.category];
          return (
            <Card
              key={task.id}
              className="overflow-hidden transition-shadow hover:shadow-md"
              style={{ borderLeftColor: meta.color, borderLeftWidth: "4px" }}
            >
              {/* Task header (always visible) */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                onClick={() => toggleExpand(task.id)}
              >
                <span className="text-xs text-[#C7C8C6] font-mono w-5 flex-shrink-0">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#080D00] truncate">
                    {task.title || <span className="text-[#C7C8C6]">Untitled task</span>}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <CategoryBadge category={task.category} />
                    <span className="text-xs text-[#686B63] flex items-center gap-1">
                      <Clock className="h-3 w-3" />{task.estimatedHours}h
                    </span>
                    {task.blocks && (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />block
                      </span>
                    )}
                    {task.stakeholders.length > 0 && (
                      <span className="text-xs text-[#686B63] flex items-center gap-1">
                        <Users className="h-3 w-3" />{task.stakeholders.length}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeTask(task.id); }}
                  className="text-[#C7C8C6] hover:text-red-400 transition-colors p-1 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-[#C7C8C6]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#C7C8C6]" />
                )}
              </div>

              {/* Expanded form */}
              {isOpen && (
                <CardContent className="pt-0 pb-4 px-4 border-t border-[#F7F7F7]">
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {/* Title */}
                    <div className="col-span-2">
                      <Label htmlFor={`title-${task.id}`}>Task title *</Label>
                      <Input
                        id={`title-${task.id}`}
                        className="mt-1"
                        placeholder="e.g. Redesign onboarding flow"
                        value={task.title}
                        onChange={(e) => updateTask(task.id, { title: e.target.value })}
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <Label>Category *</Label>
                      <Select
                        value={task.category}
                        onValueChange={(v) => updateTask(task.id, { category: v as TaskCategory })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(([key, meta]) => (
                            <SelectItem key={key} value={key}>
                              <span className="flex items-center gap-2">
                                <span
                                  className="h-2 w-2 rounded-full inline-block"
                                  style={{ backgroundColor: meta.color }}
                                />
                                {meta.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-[#686B63] mt-1">{CATEGORY_META[task.category].description}</p>
                    </div>

                    {/* Estimated hours */}
                    <div>
                      <Label htmlFor={`hours-${task.id}`}>Estimated hours *</Label>
                      <Input
                        id={`hours-${task.id}`}
                        type="number"
                        min={0.25}
                        max={40}
                        step={0.25}
                        className="mt-1"
                        value={task.estimatedHours}
                        onChange={(e) =>
                          updateTask(task.id, { estimatedHours: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>

                    {/* Stakeholders */}
                    <div>
                      <Label htmlFor={`stakeholders-${task.id}`}>Stakeholders</Label>
                      <Input
                        id={`stakeholders-${task.id}`}
                        className="mt-1"
                        placeholder="Ana, Pedro, Design team"
                        value={task.stakeholders.join(", ")}
                        onChange={(e) =>
                          updateTask(task.id, { stakeholders: parseStakeholders(e.target.value) })
                        }
                      />
                      <p className="text-xs text-[#686B63] mt-1">Comma-separated names</p>
                    </div>

                    {/* Requested by */}
                    <div>
                      <Label htmlFor={`req-${task.id}`}>Requested by</Label>
                      <Input
                        id={`req-${task.id}`}
                        className="mt-1"
                        placeholder="e.g. Product Manager"
                        value={task.requestedBy}
                        onChange={(e) => updateTask(task.id, { requestedBy: e.target.value })}
                      />
                    </div>

                    {/* Blocks */}
                    <div className="col-span-2">
                      <Label htmlFor={`blocks-${task.id}`}>
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                          Potential blocks / dependencies
                        </span>
                      </Label>
                      <Textarea
                        id={`blocks-${task.id}`}
                        className="mt-1 min-h-[64px]"
                        placeholder="Waiting for design specs, need API docs from backend…"
                        value={task.blocks}
                        onChange={(e) => updateTask(task.id, { blocks: e.target.value })}
                      />
                    </div>

                    {/* Notes */}
                    <div className="col-span-2">
                      <Label htmlFor={`notes-${task.id}`}>Notes</Label>
                      <Textarea
                        id={`notes-${task.id}`}
                        className="mt-1 min-h-[64px]"
                        placeholder="Context, links, references…"
                        value={task.notes}
                        onChange={(e) => updateTask(task.id, { notes: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add task */}
      <button
        onClick={addTask}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#C7C8C6] rounded-xl text-sm text-[#686B63] hover:border-[#FFD115] hover:text-[#421E06] hover:bg-[#FFFEF5] transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add task
      </button>

      {/* Bottom save */}
      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save & schedule week"}
        </Button>
      </div>
    </div>
  );
}
