// src/app/api/session/[id]/shot/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Session } from "@/models/Session";
import { Shot } from "@/models/Shot";
import { scoreShot } from "@/lib/scoring";

interface RouteParams {
  params: { id: string };
}

// POST /api/session/:id/shot
export async function POST(req: NextRequest, { params }: RouteParams) {
  await connectDB();
  const { id } = params;
  const body = await req.json();

  const session = await Session.findById(id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const { tsMs, xMm, yMm } = body;
  if (tsMs == null || xMm == null || yMm == null) {
    return NextResponse.json(
      { error: "tsMs, xMm, yMm are required" },
      { status: 400 }
    );
  }

  const count = await Shot.countDocuments({ sessionId: id });
  const index = count; // 0-based; use count+1 if you prefer 1-based

  const scored = scoreShot({ xMm, yMm });

  const shot = await Shot.create({
    sessionId: session._id,
    index,
    tsMs,
    xMm,
    yMm,
    score: scored.score,
    ring: scored.ring,
    isInnerTen: scored.isInnerTen,
  });

  return NextResponse.json(shot);
}
