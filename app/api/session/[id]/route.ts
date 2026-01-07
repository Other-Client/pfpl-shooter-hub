// app/api/session/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Session } from "@/models/Session";
import { requireAuth } from "@/lib/jwt";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/session/:id
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    console.log(params)
    const decoded:any = await requireAuth(req);
    console.log(decoded)
    // Support common claim names
    const userId = decoded?.userId ?? decoded?.sub ?? decoded?.id;

    if (!userId) {
      // return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const session = await Session.findById(id).populate("shooterId", "name email"); // Populate shooter details if needed
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    console.log("ssss", session.shooterId.toString(), userId);
    // Ensure the session belongs to the authenticated user
    if (session.shooterId.toString() !== userId) {
      // return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(session);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
