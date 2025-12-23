// src/app/api/shooter/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Shooter } from "@/models/Shooter";
import { requireAuth } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    // Validate JWT token
    const token = await requireAuth(req);

    await connectDB();
    const body = await req.json();
    const { name, email, dominantEye } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const shooter = await Shooter.create({ name, email, dominantEye });
    return NextResponse.json(shooter);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
