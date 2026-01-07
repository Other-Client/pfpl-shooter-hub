// GET /api/session/me -> list sessions for authenticated shooter (token-derived)
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Session } from "@/models/Session";
import { requireAuth } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);
    await connectDB();

    const userId =
      (decoded as any)?.userId ?? (decoded as any)?.sub ?? (decoded as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
    }

    const sessions = await Session.find({ shooterId: userId })
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
