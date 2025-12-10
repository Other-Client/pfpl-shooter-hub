import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Shooter } from "@/models/Shooter";

export async function GET() {
  try {
    const conn = await connectDB();

    // optional ping
    await conn.connection.db.admin().ping();

    // try a simple query
    const shooterCount = await Shooter.countDocuments();

    return NextResponse.json({
      ok: true,
      dbName: conn.connection.db.databaseName,
      shooterCount,
    });
  } catch (err: any) {
    console.error("DB health check failed:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}