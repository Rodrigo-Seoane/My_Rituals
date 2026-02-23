"use client";
import { useState } from "react";
import { WeeklyTask, CATEGORY_META, WORKING_HOURS } from "@/lib/types";
import {
  getWeekDays,
  getDayName,
  formatDate,
  timeToMinutes,
  minutesToTime,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getToday } from "@/lib/utils";

interface WeekGridProps {
  mondayISO: string;
  tasks: WeeklyTask[];
}

const GRID_START = timeToMinutes(WORKING_HOURS.morningStart); // 09:00 = 540
const GRID_END = timeToMinutes(WORKING_HOURS.afternoonEnd);   // 20:00 = 1200
const GRID_TOTAL = GRID_END - GRID_START;                     // 660 min

// Hour labels to display on the Y axis
const HOUR_LABELS = Array.from({ length: 12 }, (_, i) => {
  const mins = GRID_START + i * 60;
  if (mins > GRID_END) return null;
  return minutesToTime(mins);
}).filter(Boolean) as string[];

function timePercent(time: string) {
  return ((timeToMinutes(time) - GRID_START) / GRID_TOTAL) * 100;
}

export function WeekGrid({ mondayISO, tasks }: WeekGridProps) {
  const days = getWeekDays(mondayISO);
  const today = getToday();
  const [selectedDay, setSelectedDay] = useState<string>(
    days.includes(today) ? today : days[0]
  );

  const lunchTop = timePercent(WORKING_HOURS.lunchStart);
  const lunchHeight =
    timePercent(WORKING_HOURS.lunchEnd) - timePercent(WORKING_HOURS.lunchStart);

  return (
    <div className="w-full">

      {/* Mobile day-selector view — hidden on lg and above */}
      <div className="lg:hidden">
        {/* Day tab selector */}
        <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
          {days.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDay(date)}
              className={cn(
                "flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                selectedDay === date
                  ? "bg-[#FFD115] text-[#421E06] font-semibold"
                  : date === today
                  ? "bg-[#FFF9D6] text-[#421E06]"
                  : "bg-white text-[#686B63] border border-[#C7C8C6]"
              )}
            >
              <span className="font-heading font-semibold block">{getDayName(date).slice(0, 3)}</span>
              <span className="text-xs opacity-70 block">{formatDate(date, "MMM d")}</span>
            </button>
          ))}
        </div>

        {/* Single day column */}
        <div
          className={cn(
            "relative rounded-lg border w-full",
            selectedDay === today
              ? "border-[#FFD115] bg-[#FFFEF5]"
              : "border-[#C7C8C6] bg-white"
          )}
          style={{ height: "500px" }}
        >
          {/* Hour grid lines */}
          {HOUR_LABELS.map((label) => (
            <div
              key={label}
              className="absolute w-full border-t border-[#F0F0EF] flex items-center"
              style={{ top: `${timePercent(label)}%` }}
            >
              <span className="text-[10px] text-[#C7C8C6] pl-1 leading-none -translate-y-1/2">
                {label}
              </span>
            </div>
          ))}

          {/* Lunch block */}
          <div
            className="absolute w-full bg-[#F7F7F7] border-y border-[#EBEBEA] flex items-center justify-center"
            style={{ top: `${lunchTop}%`, height: `${lunchHeight}%` }}
          >
            <span className="text-[10px] text-[#C7C8C6] font-medium">Lunch</span>
          </div>

          {/* Tasks for the selected day */}
          {tasks
            .filter((t) => t.scheduledSlot?.day === selectedDay)
            .map((task) => {
              if (!task.scheduledSlot) return null;
              const top = timePercent(task.scheduledSlot.start);
              const height =
                timePercent(task.scheduledSlot.end) -
                timePercent(task.scheduledSlot.start);
              const meta = CATEGORY_META[task.category];
              const isDone = task.status === "done";
              return (
                <div
                  key={task.id}
                  className="absolute left-0.5 right-0.5 rounded-md px-1.5 py-1 overflow-hidden cursor-pointer transition-opacity"
                  style={{
                    top: `${top}%`,
                    height: `${Math.max(height, 4)}%`,
                    backgroundColor: meta.bg,
                    borderLeft: `3px solid ${meta.color}`,
                    opacity: isDone ? 0.5 : 1,
                  }}
                  title={`${task.title}\n${task.scheduledSlot.start}–${task.scheduledSlot.end}`}
                >
                  <p
                    className="text-[10px] font-medium leading-tight truncate"
                    style={{ color: meta.text }}
                  >
                    {isDone ? "✓ " : ""}
                    {task.title}
                  </p>
                  {height > 8 && (
                    <p className="text-[9px] opacity-60" style={{ color: meta.text }}>
                      {task.scheduledSlot.start}–{task.scheduledSlot.end}
                    </p>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Desktop 5-day grid — hidden below lg */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Day headers */}
          <div className="grid grid-cols-[48px_repeat(5,1fr)] gap-1 mb-1">
            <div /> {/* spacer for time axis */}
            {days.map((date) => (
              <div
                key={date}
                className={cn(
                  "text-center py-2 rounded-t-lg text-sm font-medium",
                  date === today
                    ? "bg-[#FFD115] text-[#421E06] font-semibold"
                    : "text-[#686B63]"
                )}
              >
                <div className="font-heading font-semibold">{getDayName(date).slice(0, 3)}</div>
                <div className="text-xs opacity-70">{formatDate(date, "MMM d")}</div>
              </div>
            ))}
          </div>

          {/* Grid body */}
          <div className="grid grid-cols-[48px_repeat(5,1fr)] gap-1">
            {/* Time axis */}
            <div className="relative" style={{ height: "660px" }}>
              {HOUR_LABELS.map((label) => (
                <div
                  key={label}
                  className="absolute text-[10px] text-[#C7C8C6] text-right pr-1 w-full leading-none"
                  style={{ top: `${timePercent(label)}%`, transform: "translateY(-50%)" }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((date) => {
              const dayTasks = tasks.filter((t) => t.scheduledSlot?.day === date);
              return (
                <div
                  key={date}
                  className={cn(
                    "relative rounded-lg border",
                    date === today
                      ? "border-[#FFD115] bg-[#FFFEF5]"
                      : "border-[#C7C8C6] bg-white"
                  )}
                  style={{ height: "660px" }}
                >
                  {/* Hour grid lines */}
                  {HOUR_LABELS.map((label) => (
                    <div
                      key={label}
                      className="absolute w-full border-t border-[#F0F0EF]"
                      style={{ top: `${timePercent(label)}%` }}
                    />
                  ))}

                  {/* Lunch block */}
                  <div
                    className="absolute w-full bg-[#F7F7F7] border-y border-[#EBEBEA] flex items-center justify-center"
                    style={{
                      top: `${lunchTop}%`,
                      height: `${lunchHeight}%`,
                    }}
                  >
                    <span className="text-[10px] text-[#C7C8C6] rotate-0 font-medium">
                      Lunch
                    </span>
                  </div>

                  {/* Tasks */}
                  {dayTasks.map((task) => {
                    if (!task.scheduledSlot) return null;
                    const top = timePercent(task.scheduledSlot.start);
                    const height =
                      timePercent(task.scheduledSlot.end) -
                      timePercent(task.scheduledSlot.start);
                    const meta = CATEGORY_META[task.category];
                    const isDone = task.status === "done";
                    return (
                      <div
                        key={task.id}
                        className="absolute left-0.5 right-0.5 rounded-md px-1.5 py-1 overflow-hidden cursor-pointer transition-opacity"
                        style={{
                          top: `${top}%`,
                          height: `${Math.max(height, 4)}%`,
                          backgroundColor: meta.bg,
                          borderLeft: `3px solid ${meta.color}`,
                          opacity: isDone ? 0.5 : 1,
                        }}
                        title={`${task.title}\n${task.scheduledSlot.start}–${task.scheduledSlot.end}`}
                      >
                        <p
                          className="text-[10px] font-medium leading-tight truncate"
                          style={{ color: meta.text }}
                        >
                          {isDone ? "✓ " : ""}{task.title}
                        </p>
                        {height > 8 && (
                          <p className="text-[9px] opacity-60" style={{ color: meta.text }}>
                            {task.scheduledSlot.start}–{task.scheduledSlot.end}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
