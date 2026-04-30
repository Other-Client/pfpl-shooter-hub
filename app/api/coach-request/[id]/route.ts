import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/jwt";
import { Shooter } from "@/models/Shooter";
import { CoachRequest } from "@/models/CoachRequest";

type RouteParams = { id: string };

// PATCH /api/coach-request/[id] — coach approves or rejects a request
export async function PATCH(
  req: NextRequest,
  context: { params: RouteParams | Promise<RouteParams> }
) {
  try {
    const decoded = await requireAuth(req);
    const coachId = (decoded as any)?.userId ?? (decoded as any)?.sub;
    const role = (decoded as any)?.role;

    if (!coachId || role !== "coach") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: requestId } = await (context.params instanceof Promise
      ? context.params
      : Promise.resolve(context.params));

    const { action } = await req.json();
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
    }

    await connectDB();

    const request = await CoachRequest.findOne({ _id: requestId, coachId, status: "pending" });
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (action === "approve") {
      // Check the shooter doesn't already have a coach (race condition guard)
      const shooter = await Shooter.findById(request.shooterId);
      if (!shooter) {
        return NextResponse.json({ error: "Shooter not found" }, { status: 404 });
      }
      if (shooter.coachId) {
        return NextResponse.json({ error: "Shooter already has a coach" }, { status: 409 });
      }

      // Link shooter to coach
      await Shooter.findByIdAndUpdate(request.shooterId, { coachId });

      // Reject any other pending requests from this shooter to other coaches
      await CoachRequest.updateMany(
        { shooterId: request.shooterId, _id: { $ne: requestId }, status: "pending" },
        { status: "rejected" }
      );

      request.status = "approved";
    } else {
      request.status = "rejected";
    }

    await request.save();

    return NextResponse.json({ ok: true, status: request.status });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
