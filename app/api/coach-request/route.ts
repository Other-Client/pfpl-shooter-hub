import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/jwt";
import { Shooter } from "@/models/Shooter";
import { CoachRequest } from "@/models/CoachRequest";

// POST /api/coach-request — shooter applies to join a coach
export async function POST(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);
    const shooterId = (decoded as any)?.userId ?? (decoded as any)?.sub;
    if (!shooterId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const shooter = await Shooter.findById(shooterId).lean();
    if (!shooter) {
      return NextResponse.json({ error: "Shooter not found" }, { status: 404 });
    }
    if (shooter.role !== "shooter") {
      return NextResponse.json({ error: "Only shooter accounts can request to join a coach" }, { status: 403 });
    }
    if (shooter.coachId) {
      return NextResponse.json({ error: "You already have a coach" }, { status: 409 });
    }

    const { coachId } = await req.json();
    if (!coachId) {
      return NextResponse.json({ error: "coachId is required" }, { status: 400 });
    }

    const coach = await Shooter.findOne({ _id: coachId, role: "coach" }).lean();
    if (!coach) {
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
    }

    // Check for any existing non-rejected request to this coach
    const existing = await CoachRequest.findOne({ shooterId, coachId }).lean();
    if (existing && (existing as any).status !== "rejected") {
      return NextResponse.json({ error: "Request already sent" }, { status: 409 });
    }

    // Upsert: if previously rejected, allow re-applying
    const request = await CoachRequest.findOneAndUpdate(
      { shooterId, coachId },
      { status: "pending" },
      { upsert: true, new: true }
    );

    return NextResponse.json({ ok: true, requestId: request._id.toString() }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/coach-request — coach gets their pending requests
export async function GET(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);
    const coachId = (decoded as any)?.userId ?? (decoded as any)?.sub;
    const role = (decoded as any)?.role;

    if (!coachId || role !== "coach") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const requests = await CoachRequest.find({ coachId, status: "pending" })
      .populate("shooterId", "name email organization")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      requests.map((r: any) => ({
        _id: r._id.toString(),
        status: r.status,
        createdAt: r.createdAt,
        shooter: {
          _id: r.shooterId?._id?.toString() ?? r.shooterId?.toString(),
          name: r.shooterId?.name ?? null,
          email: r.shooterId?.email ?? null,
          organization: r.shooterId?.organization ?? null,
        },
      }))
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
