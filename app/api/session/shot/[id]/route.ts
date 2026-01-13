// src/app/api/session/shot/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Session } from "@/models/Session";
import { Shot } from "@/models/Shot";
import { requireAuth } from "@/lib/jwt";
import { scoreShot } from "@/lib/scoring";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const computeSummary = (shots: Array<{ xMm: number; yMm: number; score: number }>) => {
  if (!shots.length) return null;

  const totalScore = shots.reduce((sum, s) => sum + (s.score || 0), 0);
  const averageScore = totalScore / shots.length;

  let avgX = 0;
  let avgY = 0;
  shots.forEach((s) => {
    avgX += s.xMm;
    avgY += s.yMm;
  });
  avgX /= shots.length;
  avgY /= shots.length;

  let groupSizeMm = 0;
  shots.forEach((s) => {
    const dx = s.xMm - avgX;
    const dy = s.yMm - avgY;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > groupSizeMm) groupSizeMm = d;
  });

  return {
    totalScore,
    averageScore,
    shotCount: shots.length,
    groupSizeMm,
    offsetXMm: avgX,
    offsetYMm: avgY,
  };
};

// GET /api/session/shot/:id -> full session details + shots
export async function GET(req: NextRequest, { params }: RouteParams) {
  await connectDB();
  const { id } = await params;

  const session = await Session.findById(id).lean();
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const shots = await Shot.find({ sessionId: id }).sort({ index: 1 }).lean();

  return NextResponse.json({ session, shots });
}

// PATCH /api/session/shot/:id -> finish session with summary, shots, and artifacts
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const decoded = await requireAuth(req);
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const { summary, shots, heatmapUrl, targetSnapshotUrl } = body || {};

    const session = await Session.findById(id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const userId = (decoded as any)?.userId ?? (decoded as any)?.sub ?? (decoded as any)?.id;
    if (userId && session.shooterId.toString() !== String(userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let insertedShots:
      | Array<{ sessionId: unknown; index: number; tsMs: number; xMm: number; yMm: number; score: number; ring: number; isInnerTen: boolean }>
      | null = null;

    if (Array.isArray(shots) && shots.length && false) {
      // Replace existing shots with the provided final list to avoid duplicates or partial saves.
      // await Shot.deleteMany({ sessionId: id });

      // const shotDocs = shots.map((s, idx) => {
      //   const { tsMs, xMm, yMm } = s ?? {};
      //   if (tsMs == null || xMm == null || yMm == null) {
      //     throw new Error("Each shot requires tsMs, xMm, and yMm");
      //   }

      //   const scored = scoreShot({ xMm, yMm });
      //   return {
      //     sessionId: session._id,
      //     index: idx,
      //     tsMs,
      //     xMm,
      //     yMm,
      //     score: scored.score,
      //     ring: scored.ring,
      //     isInnerTen: scored.isInnerTen,
      //   };
      // });

      // insertedShots = await Shot.insertMany(shotDocs);
    }else {
  // reuse shots already in DB
      insertedShots = await Shot.find({ sessionId: id }).sort({ index: 1 }).lean();
    }
    console.log('inserted shots',insertedShots)

    const computedSummary = insertedShots ? computeSummary(insertedShots) : null;
    const nextSummary =
      summary ||
      computedSummary || {
        shotCount: insertedShots?.length ?? session.summary?.shotCount ?? 0,
        totalScore: insertedShots?.reduce((sum, s) => sum + (s.score || 0), 0) ?? 0,
        averageScore:
          insertedShots && insertedShots.length
            ? insertedShots.reduce((sum, s) => sum + (s.score || 0), 0) / insertedShots.length
            : session.summary?.averageScore ?? 0,
      };

    session.finishedAt = new Date();
    if (nextSummary) session.summary = nextSummary as any;
    if (heatmapUrl) session.heatmapUrl = heatmapUrl;
    if (targetSnapshotUrl) session.targetSnapshotUrl = targetSnapshotUrl;

    await session.save();

    return NextResponse.json({
      session,
      shots: insertedShots,
    });
  } catch (error: any) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes("requires tsMs")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
