// src/app/api/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Session } from "@/models/Session";
import { Shooter } from "@/models/Shooter";
import { requireAuth } from "@/lib/jwt";

const DEFAULT_GUN_PRESET = "10m_pistol";
const DEFAULT_TARGET_TYPE = "10m_standard";

// POST /api/session -> start new session
export async function POST(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);
    await connectDB();
    const body = await req.json();

    const shooterId =
      (decoded as any)?.userId ?? (decoded as any)?.sub ?? (decoded as any)?.id;
    if (!shooterId) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
    }

    const gunPreset = body.gunPreset ?? DEFAULT_GUN_PRESET;
    const targetType = body.targetType ?? DEFAULT_TARGET_TYPE;
    const settings = body.settings || {};

    const shooter = await Shooter.findById(shooterId);
    if (!shooter) {
      return NextResponse.json({ error: "Shooter not found" }, { status: 404 });
    }

    const session = await Session.create({
      shooterId,
      gunPreset,
      targetType,
      settings,
      startedAt: new Date(),
    });

    return NextResponse.json(session);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
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
