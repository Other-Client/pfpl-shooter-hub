// GET /api/session/shooter/:id -> list all sessions for a shooter
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Session } from "@/models/Session";
import { requireAuth } from "@/lib/jwt";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const decoded = await requireAuth(req);
    await connectDB();

    // Prefer common claim keys from token
    const userId =
      (decoded as any)?.userId ?? (decoded as any)?.sub ?? (decoded as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
    }

    // Ignore route param; always scope by token identity
    await params;

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
