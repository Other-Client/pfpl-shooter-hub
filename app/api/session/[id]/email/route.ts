import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAppBaseUrl, sendSessionReportEmail } from "@/lib/email";
import { requireAuth } from "@/lib/jwt";
import { buildSessionEmailReport } from "@/lib/session-report";
import { Session } from "@/models/Session";
import { Shooter } from "@/models/Shooter";
import { Shot } from "@/models/Shot";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const decoded: any = await requireAuth(req);
    const userId = decoded?.userId ?? decoded?.sub ?? decoded?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const recipientEmailRaw = String(body?.recipientEmail || "")
      .trim()
      .toLowerCase();

    await connectDB();
    const { id } = await params;

    const [session, shots, shooter] = await Promise.all([
      Session.findOne({ _id: id, shooterId: userId }).lean(),
      Shot.find({ sessionId: id }).sort({ index: 1 }).lean(),
      Shooter.findById(userId).select("name email").lean(),
    ]);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const recipientEmail = recipientEmailRaw || shooter?.email || "";
    if (!recipientEmail) {
      return NextResponse.json(
        { error: "Recipient email is required." },
        { status: 400 }
      );
    }

    const appBaseUrl = getAppBaseUrl();
    const report = buildSessionEmailReport({
      session: {
        _id: session._id,
        startedAt: session.startedAt,
        gunPreset: session.gunPreset,
        targetType: session.targetType,
        summary: session.summary,
      },
      shots: shots.map((shot: any) => ({
        index: shot.index,
        tsMs: shot.tsMs,
        xMm: shot.xMm,
        yMm: shot.yMm,
        score: shot.score,
        ring: shot.ring,
        isInnerTen: shot.isInnerTen,
      })),
      shooterName: shooter?.name || decoded?.name || decoded?.email || null,
      recipientEmail,
      sessionUrl: appBaseUrl ? `${appBaseUrl}/dashboard/session/${id}` : null,
    });

    await sendSessionReportEmail({
      to: recipientEmail,
      recipientName: shooter?.name || decoded?.name || null,
      report,
    });

    return NextResponse.json({
      ok: true,
      recipientEmail,
      message: "Session report email sent.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Session report email error:", error);
    return NextResponse.json(
      { error: "Unable to send session report email." },
      { status: 500 }
    );
  }
}
