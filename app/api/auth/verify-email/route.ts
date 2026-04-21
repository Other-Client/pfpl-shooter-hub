import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { EmailVerificationToken } from "@/models/EmailVerificationToken";
import { Shooter } from "@/models/Shooter";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token")?.trim() ?? "";

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const hashedToken = createHash("sha256").update(token).digest("hex");
    const record = await EmailVerificationToken.findOne({
      hashedToken,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return NextResponse.json(
        { error: "This verification link is invalid or has expired." },
        { status: 400 }
      );
    }

    const shooter = await Shooter.findByIdAndUpdate(
      record.shooterId,
      { $set: { emailVerified: true } },
      { new: true }
    );

    if (!shooter) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    record.usedAt = new Date();
    await record.save();
    await EmailVerificationToken.deleteMany({ shooterId: shooter._id });

    // Send welcome email now that the address is confirmed
    try {
      await sendWelcomeEmail({ to: shooter.email!, name: shooter.name });
    } catch {
      // Non-blocking — verification still succeeded
    }

    return NextResponse.json({ ok: true, message: "Email verified successfully." });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Unable to verify email right now." },
      { status: 500 }
    );
  }
}
