import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Shooter } from "@/models/Shooter";

// GET /api/coaches?q=searchTerm — search for coach accounts
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  const filter: any = { role: "coach" };
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { organization: { $regex: q, $options: "i" } },
    ];
  }

  const coaches = await Shooter.find(filter)
    .select("name organization")
    .limit(20)
    .lean();

  return NextResponse.json(
    coaches.map((c: any) => ({
      _id: c._id.toString(),
      name: c.name,
      organization: c.organization ?? null,
    }))
  );
}
