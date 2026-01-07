// GET /api/session/all -> list all sessions (optionally filter by shooterId)
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Session } from "@/models/Session";
import { requireAuth } from "@/lib/jwt";

const ALLOWED_ORIGIN = process.env.CORS_ALLOWED_ORIGIN || "https://app.zimension3d.com";
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

const withCors = (res: NextResponse) => {
  Object.entries(corsHeaders).forEach(([key, value]) => res.headers.set(key, value));
  res.headers.append("Vary", "Origin");
  return res;
};

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

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

    return withCors(NextResponse.json(sessions));
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }
    return withCors(NextResponse.json({ error: "Internal server error" }, { status: 500 }));
  }
}
