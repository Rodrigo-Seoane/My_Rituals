import { NextRequest, NextResponse } from "next/server";
import { getWeeklyReview, saveWeeklyReview } from "@/lib/data";
import { WeeklyReview } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  const review = await getWeeklyReview(date);
  if (!review) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(review);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  const body = (await req.json()) as WeeklyReview;
  body.weekOf = date;
  body.createdAt = body.createdAt ?? new Date().toISOString();
  await saveWeeklyReview(body);
  return NextResponse.json(body);
}
