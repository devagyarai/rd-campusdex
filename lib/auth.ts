import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  sessionVersion: number;
  iat?: number;
  exp?: number;
}

export async function signToken(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || "7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string, skipSessionValidation = false): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const decoded = payload as unknown as JWTPayload;
    
    // Validate sessionVersion if not skipping
    if (!skipSessionValidation) {
      const isValid = await validateSessionVersion(decoded.userId, decoded.sessionVersion);
      if (!isValid) {
        console.log("[verifyToken] validateSessionVersion returned false");
        return null;
      }
    }

    return decoded;
  } catch (err) {
    console.error("[verifyToken] error:", err);
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("campusdex-token")?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(req: NextRequest, skipSessionValidation = false): Promise<JWTPayload | null> {
  const token = req.cookies.get("campusdex-token")?.value;
  if (!token) return null;
  return await verifyToken(token, skipSessionValidation);
}

export function setTokenCookie(token: string, response: Response): void {
  response.headers.set(
    "Set-Cookie",
    `campusdex-token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`
  );
}

export function clearTokenCookie(): string {
  return `campusdex-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

// In-memory cache for session versions (per-instance, fallback for Redis)
const sessionCache = new Map<string, { version: number; expiresAt: number }>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export async function validateSessionVersion(userId: string, tokenVersion: number): Promise<boolean> {
  const now = Date.now();
  const cached = sessionCache.get(userId);

  if (cached && cached.expiresAt > now) {
    return tokenVersion === cached.version;
  }

  // Not in cache or expired, fetch from DB
  const { db } = await import("./db");
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { sessionVersion: true }
  });

  if (!user) return false;

  sessionCache.set(userId, { version: user.sessionVersion, expiresAt: now + CACHE_TTL });
  return tokenVersion === user.sessionVersion;
}

export function invalidateUserSessionCache(userId: string) {
  sessionCache.delete(userId);
}

export function verifyInternalRequest(req: Request): boolean {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET) {
    console.warn("CRON_SECRET is not set. Denying internal request.");
    return false;
  }
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}
