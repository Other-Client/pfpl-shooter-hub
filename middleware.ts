import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value;
  const authHeader = req.headers.get("authorization");

  // Allow API requests that present a Bearer token to reach route handlers for validation
  if (req.nextUrl.pathname.startsWith("/api/") && authHeader?.startsWith("Bearer ")) {
    return NextResponse.next();
  }

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);

    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/experience/:path*",
    "/api/session/:path*",
    "/api/shooter/:path*",
  ],
};
