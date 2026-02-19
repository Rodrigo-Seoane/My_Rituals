export type TaskCategory =
  | "personal"
  | "management"
  | "creation"
  | "consumption"
  | "ideation";

export type TaskStatus = "pending" | "in-progress" | "done" | "blocked";

export interface TimeSlot {
  day: string; // ISO date "2026-02-16"
  start: string; // "09:00"
  end: string; // "11:00"
}

export interface WeeklyTask {
  id: string;
  title: string;
  category: TaskCategory;
  estimatedHours: number;
  stakeholders: string[];
  blocks: string;
  requestedBy: string;
  notes: string;
  scheduledSlot?: TimeSlot;
  status: TaskStatus;
}

export interface WeeklyAgenda {
  weekOf: string; // Monday ISO date "2026-02-16"
  tasks: WeeklyTask[];
  createdAt: string;
  updatedAt: string;
}

export interface DailyTaskUpdate {
  taskId: string;
  status: TaskStatus;
  note: string;
}

export interface DailyOps {
  date: string; // ISO date "2026-02-19"
  weekOf: string; // which weekly agenda this belongs to
  yesterday: string;
  today: string;
  blockers: string;
  energy: "high" | "medium" | "low";
  taskUpdates: DailyTaskUpdate[];
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyReview {
  weekOf: string; // Monday ISO date
  accomplishments: string;
  difficulties: string;
  learnings: string;
  nextWeekFocus: string;
  completedTaskIds: string[];
  createdAt: string;
  updatedAt: string;
}

export const CATEGORY_META: Record<
  TaskCategory,
  { label: string; color: string; bg: string; text: string; description: string }
> = {
  personal: {
    label: "Personal",
    color: "#FFD115",
    bg: "#FFF9D6",
    text: "#421E06",
    description: "Life commitments & personal blocks",
  },
  management: {
    label: "Management",
    color: "#686B63",
    bg: "#EBEBEA",
    text: "#3A3D38",
    description: "Meetings, calls, email, people",
  },
  creation: {
    label: "Creation",
    color: "#421E06",
    bg: "#F0E8E3",
    text: "#421E06",
    description: "Writing, building, coding",
  },
  consumption: {
    label: "Consumption",
    color: "#3D6B4F",
    bg: "#E4F0E9",
    text: "#224035",
    description: "Reading, listening, studying",
  },
  ideation: {
    label: "Ideation",
    color: "#7C5230",
    bg: "#F2E9E2",
    text: "#5A3A20",
    description: "Brainstorming, journaling, reflecting",
  },
};

export const WORKING_HOURS = {
  morningStart: "09:00",
  morningEnd: "13:30",
  afternoonStart: "15:30",
  afternoonEnd: "20:00",
  lunchStart: "13:30",
  lunchEnd: "15:30",
};

export const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
