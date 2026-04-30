import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/jwt";
import { Shooter } from "@/models/Shooter";
import { Session } from "@/models/Session";

// GET /api/coach/shooters — list shooters under this coach with their latest session
export async function GET(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);
    const coachId = (decoded as any)?.userId ?? (decoded as any)?.sub;
    const role = (decoded as any)?.role;

    if (!coachId || role !== "coach") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const shooters = await Shooter.find({ coachId })
      .select("name email organization createdAt")
      .lean();

    const results = await Promise.all(
      shooters.map(async (shooter: any) => {
        const latestSession = await Session.findOne({ shooterId: shooter._id })
          .sort({ startedAt: -1 })
          .select("startedAt gunPreset targetType summary")
          .lean();

        return {
          shooter: {
            _id: shooter._id.toString(),
            name: shooter.name,
            email: shooter.email ?? null,
            organization: shooter.organization ?? null,
          },
          latestSession: latestSession
            ? {
                _id: (latestSession as any)._id.toString(),
                startedAt: (latestSession as any).startedAt,
                gunPreset: (latestSession as any).gunPreset,
                targetType: (latestSession as any).targetType,
                summary: (latestSession as any).summary ?? null,
              }
            : null,
        };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
