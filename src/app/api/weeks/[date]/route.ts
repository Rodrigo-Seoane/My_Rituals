import { NextRequest, NextResponse } from "next/server";
import { getWeeklyAgenda, saveWeeklyAgenda } from "@/lib/data";
import { scheduleTasks } from "@/lib/scheduler";
import { WeeklyAgenda } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  const agenda = await getWeeklyAgenda(date);
  if (!agenda) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(agenda);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  const body = (await req.json()) as WeeklyAgenda;
  body.weekOf = date;
  body.createdAt = body.createdAt ?? new Date().toISOString();

  // Auto-schedule any unscheduled tasks
  body.tasks = scheduleTasks(body.tasks, date);

  await saveWeeklyAgenda(body);
  return NextResponse.json(body);
}
