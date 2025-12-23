import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { Shooter } from "@/models/Shooter";

const JWT_SECRET = process.env.JWT_SECRET || "";
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET in env");

export async function POST(req: NextRequest) {
  await connectDB();

  const body = await req.json();
  const { email, password } = body ?? {};

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const emailTrimmed = String(email).trim().toLowerCase();
  const passwordStr = String(password);

  const shooter = await Shooter.findOne({ email: emailTrimmed });
  if (!shooter) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // If you have old users without passwordHash, handle explicitly:
  if (!shooter.passwordHash) {
    return NextResponse.json(
      { error: "Password not set for this account. Please signup again or reset password." },
      { status: 400 }
    );
  }

  const ok = await bcrypt.compare(passwordStr, shooter.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = jwt.sign(
    { sub: shooter._id.toString(), email: shooter.email, name: shooter.name },
    JWT_SECRET,
    { expiresIn: "30d" }
  );

  const res = NextResponse.json({
    shooterId: shooter._id.toString(),
    name: shooter.name,
    email: shooter.email,
    token,
  });

  // Strongly recommended: httpOnly cookie so JS cannot steal it if XSS happens
  res.cookies.set("shooterId", shooter._id.toString(), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  // Optional: store JWT as httpOnly cookie too (recommended if you use JWT)
  res.cookies.set("authToken", token, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
