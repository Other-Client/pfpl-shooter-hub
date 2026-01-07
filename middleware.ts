import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGIN = process.env.CORS_ALLOWED_ORIGIN || "*";
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

const applyCorsHeaders = (res: NextResponse, isApiRoute: boolean) => {
  if (!isApiRoute) return res;

  Object.entries(corsHeaders).forEach(([key, value]) => res.headers.set(key, value));
  res.headers.append("Vary", "Origin");
  return res;
};

export default function middleware(req: NextRequest) {
  const isApiRoute = req.nextUrl.pathname.startsWith("/api/");
  const token = req.cookies.get("authToken")?.value;
  const authHeader = req.headers.get("authorization");

  if (req.method === "OPTIONS" && isApiRoute) {
    return applyCorsHeaders(new NextResponse(null, { status: 204 }), isApiRoute);
  }

  // Allow API requests that present a Bearer token to reach route handlers for validation
  if (isApiRoute && authHeader?.startsWith("Bearer ")) {
    return applyCorsHeaders(NextResponse.next(), isApiRoute);
  }

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);

    if (isApiRoute) {
      return applyCorsHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), isApiRoute);
    }
    return NextResponse.redirect(url);
  }
  return applyCorsHeaders(NextResponse.next(), isApiRoute);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/experience/:path*",
    "/api/session/:path*",
    "/api/shooter/:path*",
  ],
};
