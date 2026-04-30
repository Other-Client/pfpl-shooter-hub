import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/jwt";
import { Shooter } from "@/models/Shooter";

// GET /api/me/coach — returns the current shooter's coach (if any)
export async function GET(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);
    const userId = (decoded as any)?.userId ?? (decoded as any)?.sub;
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const shooter = await Shooter.findById(userId).select("coachId").lean();
    if (!shooter || !(shooter as any).coachId) {
      return NextResponse.json({ coach: null });
    }

    const coach = await Shooter.findById((shooter as any).coachId)
      .select("name organization")
      .lean();

    if (!coach) {
      return NextResponse.json({ coach: null });
    }

    return NextResponse.json({
      coach: {
        _id: (coach as any)._id.toString(),
        name: (coach as any).name,
        organization: (coach as any).organization ?? null,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
