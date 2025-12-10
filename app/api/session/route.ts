// src/app/api/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Session } from "@/models/Session";
import { Shooter } from "@/models/Shooter";

// POST /api/session -> start new session
export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  const { shooterId, gunPreset, targetType, settings } = body;

  if (!shooterId || !gunPreset || !targetType) {
    return NextResponse.json(
      { error: "shooterId, gunPreset, targetType are required" },
      { status: 400 }
    );
  }

  const shooter = await Shooter.findById(shooterId);
  if (!shooter) {
    return NextResponse.json({ error: "Shooter not found" }, { status: 404 });
  }

  const session = await Session.create({
    shooterId,
    gunPreset,
    targetType,
    settings: settings || {},
    startedAt: new Date(),
  });

  return NextResponse.json(session);
}

// GET /api/session?shooterId=... -> list sessions for a shooter
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const shooterId = searchParams.get("shooterId");

  const query: any = {};
  if (shooterId) query.shooterId = shooterId;

  const sessions = await Session.find(query)
    .sort({ startedAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json(sessions);
}
