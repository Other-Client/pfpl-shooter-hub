import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Shooter } from "@/models/Shooter";
import { Session } from "@/models/Session";
import { Shot } from "@/models/Shot";
import { scoreShot } from "@/lib/scoring";

export async function POST(req: NextRequest) {
  // 1. Auth – must be logged in
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const shooterId = (session.user as any).id;

  await connectDB();

  const shooter = await Shooter.findById(shooterId);
  if (!shooter) {
    return NextResponse.json({ error: "Shooter not found" }, { status: 404 });
  }

  // 2. Create a new session for this shooter
  const vrSession = await Session.create({
    shooterId,
    startedAt: new Date(),
    gunPreset: "10m_pistol",
    targetType: "10m_standard",
    settings: { testData: true },
  });

  // 3. Generate realistic-ish random shots around center
  const shotCount = 20 + Math.floor(Math.random() * 20); // 20–39 shots
  const shots: any[] = [];

  for (let i = 0; i < shotCount; i++) {
    // Rough “grouped” distribution: tighter cluster near center, some flyers
    const baseSpread = 12; // mm
    const flyerChance = Math.random();
    const spread = flyerChance < 0.15 ? baseSpread * 2.5 : baseSpread;

    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * spread;

    const xMm = Math.cos(angle) * radius + (Math.random() - 0.5) * 2; // tiny jitter
    const yMm = Math.sin(angle) * radius + (Math.random() - 0.5) * 2;

    const scored = scoreShot({ xMm, yMm });

    const shot = await Shot.create({
      sessionId: vrSession._id,
      index: i,
      tsMs: Date.now() + i * 1000,
      xMm,
      yMm,
      score: scored.score,
      ring: scored.ring,
      isInnerTen: scored.isInnerTen,
    });

    shots.push(shot);
  }

  // 4. Compute simple summary and update session
  const totalScore = shots.reduce((sum, s) => sum + (s.score || 0), 0);
  const avgScore = shots.length ? totalScore / shots.length : 0;

  let avgX = 0,
    avgY = 0;
  shots.forEach((s) => {
    avgX += s.xMm;
    avgY += s.yMm;
  });
  if (shots.length) {
    avgX /= shots.length;
    avgY /= shots.length;
  }

  let maxDist = 0;
  shots.forEach((s) => {
    const dx = s.xMm - avgX;
    const dy = s.yMm - avgY;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > maxDist) maxDist = d;
  });

  vrSession.summary = {
    totalScore,
    averageScore: avgScore,
    shotCount,
    groupSizeMm: maxDist,
    offsetXMm: avgX,
    offsetYMm: avgY,
  };

  await vrSession.save();

  return NextResponse.json({
    ok: true,
    sessionId: vrSession._id,
    shotCount,
  });
}
