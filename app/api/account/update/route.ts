import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { Shooter } from "@/models/Shooter";

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token || !process.env.JWT_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId: string | null = null;
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded?.userId ?? decoded?.sub ?? decoded?.id ?? null;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const allowedFields = ["name", "email", "phone", "organization", "dominantEye", "role"];
    const update: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) update[key] = body[key];
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await connectDB();

    try {
      const updated = await Shooter.findByIdAndUpdate(
        userId,
        { $set: update },
        { new: true, runValidators: true }
      ).lean();

      if (!updated) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({
        ok: true,
        shooter: {
          id: updated._id,
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          organization: updated.organization,
          dominantEye: updated.dominantEye,
          role: updated.role,
        },
      });
    } catch (err: any) {
      if (err?.code === 11000) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
