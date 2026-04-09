import { randomBytes, createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAppBaseUrl, sendPasswordResetEmail } from "@/lib/email";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import { Shooter } from "@/models/Shooter";

const RESET_TOKEN_TTL_MS = 1000 * 60 * 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const appBaseUrl = getAppBaseUrl();
    if (!appBaseUrl) {
      return NextResponse.json(
        { error: "Reset password email is not configured yet." },
        { status: 500 }
      );
    }

    await connectDB();

    const shooter = await Shooter.findOne({ email }).lean();
    if (!shooter?.email) {
      return NextResponse.json({
        ok: true,
        message:
          "If an account with that email exists, a reset link has been sent.",
      });
    }

    const token = randomBytes(32).toString("hex");
    const hashedToken = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await PasswordResetToken.deleteMany({ shooterId: shooter._id });
    await PasswordResetToken.create({
      shooterId: shooter._id,
      hashedToken,
      expiresAt,
    });

    await sendPasswordResetEmail({
      to: shooter.email,
      name: shooter.name,
      resetUrl: `${appBaseUrl}/reset-password?token=${encodeURIComponent(
        token
      )}`,
      expiresInMinutes: 60,
    });

    return NextResponse.json({
      ok: true,
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Unable to send reset email right now." },
      { status: 500 }
    );
  }
}
