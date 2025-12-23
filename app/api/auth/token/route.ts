import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const decodedToken = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the raw JWT from the HTTP-only cookie
    const sessionCookie = req.cookies.get('next-auth.session-token');
    if (!sessionCookie) {
      return NextResponse.json({ error: "No session token found" }, { status: 401 });
    }

    const rawJwt = sessionCookie.value;

    return NextResponse.json({ token: rawJwt });
  } catch (error) {
    console.error("Error retrieving token:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}