import { WeeklyTask, WORKING_HOURS, TimeSlot } from "./types";
import { getWeekDays, timeToMinutes, minutesToTime } from "./utils";

const MORNING_MINS = {
  start: timeToMinutes(WORKING_HOURS.morningStart), // 09:00 = 540
  end: timeToMinutes(WORKING_HOURS.morningEnd),     // 13:30 = 810
};
const AFTERNOON_MINS = {
  start: timeToMinutes(WORKING_HOURS.afternoonStart), // 15:30 = 930
  end: timeToMinutes(WORKING_HOURS.afternoonEnd),     // 20:00 = 1200
};

interface DaySlots {
  date: string;
  freeBlocks: Array<{ start: number; end: number }>;
}

function buildWeekSlots(mondayISO: string): DaySlots[] {
  return getWeekDays(mondayISO).map((date) => ({
    date,
    freeBlocks: [
      { start: MORNING_MINS.start, end: MORNING_MINS.end },
      { start: AFTERNOON_MINS.start, end: AFTERNOON_MINS.end },
    ],
  }));
}

function allocate(
  daySlots: DaySlots[],
  durationMins: number
): TimeSlot | undefined {
  for (const day of daySlots) {
    for (let i = 0; i < day.freeBlocks.length; i++) {
      const block = day.freeBlocks[i];
      const available = block.end - block.start;
      if (available >= durationMins) {
        const slotStart = block.start;
        const slotEnd = slotStart + durationMins;
        // shrink the free block
        block.start = slotEnd;
        return {
          day: day.date,
          start: minutesToTime(slotStart),
          end: minutesToTime(slotEnd),
        };
      }
    }
  }
  return undefined;
}

/**
 * Distributes tasks into the working week.
 * Priority order: personal → management → creation → consumption → ideation.
 * Tasks already with a scheduledSlot are respected (skipped).
 */
export function scheduleTasks(
  tasks: WeeklyTask[],
  mondayISO: string
): WeeklyTask[] {
  const daySlots = buildWeekSlots(mondayISO);

  const categoryOrder = [
    "personal",
    "management",
    "creation",
    "consumption",
    "ideation",
  ] as const;

  const sorted = [...tasks].sort(
    (a, b) =>
      categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
  );

  const scheduled = sorted.map((task) => {
    if (task.scheduledSlot) return task; // already placed
    const durationMins = Math.round(task.estimatedHours * 60);
    const slot = allocate(daySlots, durationMins);
    return { ...task, scheduledSlot: slot };
  });

  // Restore original order
  return tasks.map(
    (t) => scheduled.find((s) => s.id === t.id) ?? t
  );
}
