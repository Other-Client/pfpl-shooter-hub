import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { sendVerificationEmail, getAppBaseUrl } from "@/lib/email";
import { Shooter } from "@/models/Shooter";
import { EmailVerificationToken } from "@/models/EmailVerificationToken";

export async function POST(req: NextRequest) {
  await connectDB();

  const body = await req.json();
  const { name, email, password, dominantEye } = body ?? {};

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required" },
      { status: 400 }
    );
  }

  const emailTrimmed = String(email).trim().toLowerCase();
  const nameTrimmed = String(name).trim();
  const passwordStr = String(password);

  if (passwordStr.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const existing = await Shooter.findOne({ email: emailTrimmed }).lean();
  if (existing) {
    return NextResponse.json(
      { error: "Account already exists. Please login." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(passwordStr, 12);

  const shooter = await Shooter.create({
    name: nameTrimmed,
    email: emailTrimmed,
    dominantEye: dominantEye === "left" || dominantEye === "right" ? dominantEye : undefined,
    passwordHash,
    emailVerified: false,
  });

  // Create verification token (24h TTL)
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

  let verificationEmailSent = false;
  try {
    await sendVerificationEmail({ to: emailTrimmed, name: nameTrimmed, verifyUrl });
    verificationEmailSent = true;
  } catch (error) {
    console.error("Verification email error:", error);
  }

  return NextResponse.json(
    {
      shooterId: shooter._id.toString(),
      name: shooter.name,
      email: shooter.email,
      verificationEmailSent,
    },
    { status: 201 }
  );
}
