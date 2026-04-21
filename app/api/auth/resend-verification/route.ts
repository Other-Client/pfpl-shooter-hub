import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { EmailVerificationToken } from "@/models/EmailVerificationToken";
import { Shooter } from "@/models/Shooter";
import { sendVerificationEmail, getAppBaseUrl } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    await connectDB();

    const shooter = await Shooter.findOne({ email });

    // Always return ok to avoid email enumeration
    if (!shooter || shooter.emailVerified) {
      return NextResponse.json({ ok: true });
    }

    // Rate-limit: block if a token was issued in the last 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const recent = await EmailVerificationToken.findOne({
      shooterId: shooter._id,
      createdAt: { $gt: twoMinutesAgo },
    });
    if (recent) {
      return NextResponse.json(
        { error: "Please wait a moment before requesting another email." },
        { status: 429 }
      );
    }

    await EmailVerificationToken.deleteMany({ shooterId: shooter._id });

    const plainToken = randomBytes(32).toString("hex");
    const hashedToken = createHash("sha256").update(plainToken).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await EmailVerificationToken.create({
      shooterId: shooter._id,
      hashedToken,
      expiresAt,
    });

    const baseUrl = getAppBaseUrl() ?? "";
    const verifyUrl = `${baseUrl}/verify-email?token=${plainToken}`;

    await sendVerificationEmail({ to: shooter.email!, name: shooter.name, verifyUrl });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Unable to send verification email right now." },
      { status: 500 }
    );
  }
}
