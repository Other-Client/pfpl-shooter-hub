// src/app/api/shooter/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Shooter } from "@/models/Shooter";

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const { name, email, dominantEye } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const shooter = await Shooter.create({ name, email, dominantEye });
  return NextResponse.json(shooter);
}
