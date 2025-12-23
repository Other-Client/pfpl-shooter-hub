import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export interface AuthenticatedRequest extends NextRequest {
  token?: any;
}

/**
 * Validates JWT token from request
 * @param req NextRequest
 * @returns JWT token payload or null if invalid
 */
export async function validateJWT(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET
    });
    return token;
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
    throw new Error("Unauthorized - Valid JWT token required");
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