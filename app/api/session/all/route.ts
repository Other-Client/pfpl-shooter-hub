// GET /api/session/all -> list all sessions (optionally filter by shooterId)
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Session } from "@/models/Session";
import { requireAuth } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const shooterId = searchParams.get("shooterId");

    const query: Record<string, unknown> = {};
    if (shooterId) {
      query.shooterId = shooterId;
    }

    const sessions = await Session.find(query)
      .sort({ startedAt: -1 })
      .populate("shooterId", "name email")
      .lean()
      .limit(500);

    return NextResponse.json(sessions);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
