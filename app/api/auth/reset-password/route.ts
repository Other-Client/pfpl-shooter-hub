import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import { Shooter } from "@/models/Shooter";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = String(body?.token || "").trim();
    const password = String(body?.password || "");

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const hashedToken = createHash("sha256").update(token).digest("hex");
    const resetToken = await PasswordResetToken.findOne({
      hashedToken,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const shooter = await Shooter.findByIdAndUpdate(
      resetToken.shooterId,
      { $set: { passwordHash } },
      { new: true }
    );

    if (!shooter) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    resetToken.usedAt = new Date();
    await resetToken.save();
    await PasswordResetToken.deleteMany({ shooterId: shooter._id });

    return NextResponse.json({
      ok: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Unable to reset password right now." },
      { status: 500 }
    );
  }
}
