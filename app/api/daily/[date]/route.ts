import { NextRequest, NextResponse } from "next/server";
import { getDailyOps, saveDailyOps } from "@/lib/data";
import { DailyOps } from "@/lib/types";
import { getMondayOf } from "@/lib/utils";
import { parseISO } from "date-fns";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  const ops = await getDailyOps(date);
  if (!ops) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(ops);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  const body = (await req.json()) as DailyOps;
  body.date = date;
  body.weekOf = body.weekOf ?? getMondayOf(parseISO(date));
  body.createdAt = body.createdAt ?? new Date().toISOString();
  await saveDailyOps(body);
  return NextResponse.json(body);
}
