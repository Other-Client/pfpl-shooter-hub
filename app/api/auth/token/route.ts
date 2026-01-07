import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const authToken = req.cookies.get("authToken")?.value;
    if (!authToken) {
      return NextResponse.json({ error: "No auth token found" }, { status: 401 });
    }
    return NextResponse.json({ token: authToken });
  } catch (error) {
    console.error("Error retrieving token:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
