// src/app/api/session/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Session } from "@/models/Session";
import { Shot } from "@/models/Shot";

interface RouteParams {
  params: { id: string };
}

// GET /api/session/:id -> full session details + shots
export async function GET(req: NextRequest, { params }: RouteParams) {
  await connectDB();
  const { id } = params;

  const session = await Session.findById(id).lean();
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const shots = await Shot.find({ sessionId: id }).sort({ index: 1 }).lean();

  return NextResponse.json({ session, shots });
}

// PATCH /api/session/:id -> finish session with summary + artifacts
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  await connectDB();
  const { id } = params;
  const body = await req.json();

  const { summary, heatmapUrl, targetSnapshotUrl } = body;

  const session = await Session.findById(id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  session.finishedAt = new Date();
  if (summary) session.summary = summary;
  if (heatmapUrl) session.heatmapUrl = heatmapUrl;
  if (targetSnapshotUrl) session.targetSnapshotUrl = targetSnapshotUrl;

  await session.save();

  return NextResponse.json(session);
}
