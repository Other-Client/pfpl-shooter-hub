// src/app/api/session/[id]/csv/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Session } from "@/models/Session";
import { Shot } from "@/models/Shot";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  await connectDB();
  const { id } = await params;

  const session = await Session.findById(id).lean();
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const shots = await Shot.find({ sessionId: id }).sort({ index: 1 }).lean();

  const header = [
    "session_id",
    "shooter_id",
    "started_at",
    "gun_preset",
    "target_type",
    "shot_index",
    "ts_ms",
    "x_mm",
    "y_mm",
    "score",
    "ring",
    "is_inner_10",
  ].join(",");

  const rows = shots.map((s) =>
    [
      session._id.toString(),
      session.shooterId.toString(),
      session.startedAt.toISOString(),
      session.gunPreset,
      session.targetType,
      s.index,
      s.tsMs,
      s.xMm,
      s.yMm,
      s.score,
      s.ring,
      s.isInnerTen ? 1 : 0,
    ].join(",")
  );

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="session-${id}.csv"`,
    },
  });
}
