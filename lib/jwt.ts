import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends NextRequest {
  token?: any;
}

const getRawToken = (req: NextRequest): string | null => {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  const cookieToken = req.cookies.get("authToken")?.value;
  return cookieToken ?? null;
};

const normalizeToken = (t: string) => {
  let s = (t || "").trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  s = s.replace(/\s+/g, "");
  return s;
};

/**
 * Validates JWT token from request
 * @param req NextRequest
 * @returns JWT token payload or null if invalid
 */
export async function validateJWT(req: NextRequest) {
  try {
    console.log(req)
    const rawToken = getRawToken(req);
    if (!rawToken) return null;
    if (!process.env.JWT_SECRET) {
      console.error("Missing JWT_SECRET in environment");
      return null;
    }
    console.log('raw', rawToken)
    const tokenClean = normalizeToken(rawToken);
    const parts = tokenClean.split(".");
    if (parts.length !== 3) return null;

    const decoded = jwt.verify(tokenClean, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error("JWT validation error:", error);
    return null;
  }
}

/**
 * Requires authentication - throws error if not authenticated
 * @param req NextRequest
 * @returns JWT token payload
 * @throws Error if not authenticated
 */
export async function requireAuth(req: NextRequest) {
  const token = await validateJWT(req);
  if (!token) {
    throw new Error("Unauthorized");
  }
  return token;
}

/**
 * Checks if user has required role
 * @param token JWT token payload
 * @param requiredRole Required role
 * @returns boolean
 */
export function hasRole(token: any, requiredRole: string): boolean {
  return token?.role === requiredRole;
}

/**
 * Checks if user is admin
 * @param token JWT token payload
 * @returns boolean
 */
export function isAdmin(token: any): boolean {
  return hasRole(token, "admin");
}

/**
 * Checks if user owns resource or is admin
 * @param token JWT token payload
 * @param resourceUserId Resource owner's user ID
 * @returns boolean
 */
export function ownsResourceOrAdmin(token: any, resourceUserId: string): boolean {
  return token?.userId === resourceUserId || isAdmin(token);
}
