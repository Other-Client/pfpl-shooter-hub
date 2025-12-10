import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Shooter } from "@/models/Shooter";

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const { name, email, dominantEye } = body;

  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 }
    );
  }

  // basic email check
  const emailTrimmed = String(email).trim().toLowerCase();
  const nameTrimmed = String(name).trim();

  let shooter = await Shooter.findOne({ email: emailTrimmed });

  if (!shooter) {
    shooter = await Shooter.create({
      name: nameTrimmed,
      email: emailTrimmed,
      dominantEye: dominantEye === "left" || dominantEye === "right"
        ? dominantEye
        : undefined,
    });
  }

  const res = NextResponse.json({
    shooterId: shooter._id.toString(),
    name: shooter.name,
    email: shooter.email,
  });

  // store shooterId in a cookie (not httpOnly so you can read from client if needed)
  res.cookies.set("shooterId", shooter._id.toString(), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return res;
}
