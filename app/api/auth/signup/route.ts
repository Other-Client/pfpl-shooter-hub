import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Shooter } from "@/models/Shooter";

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
  });

  return NextResponse.json(
    {
      shooterId: shooter._id.toString(),
      name: shooter.name,
      email: shooter.email,
    },
    { status: 201 }
  );
}
