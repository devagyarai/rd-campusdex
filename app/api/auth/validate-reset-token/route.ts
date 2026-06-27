import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fullToken = searchParams.get("token");

    if (!fullToken || !fullToken.includes(".")) {
      return NextResponse.json({ error: "Invalid token format" }, { status: 400 });
    }

    const [userId, rawToken] = fullToken.split(".");
    
    // Hash the raw token part
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    
    // Find user by ID (fast path, no timing leak regarding token validity)
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, resetPasswordToken: true, resetPasswordExpires: true }
    });

    // To prevent timing attacks that might reveal if a user exists and has a token,
    // we always perform the timingSafeEqual, using a dummy hash if needed.
    const dummyHash = crypto.createHash("sha256").update("dummy").digest("hex");
    const storedHash = user?.resetPasswordToken || dummyHash;
    
    // Both storedHash and hashedToken are 64 char hex strings (SHA-256). 
    // We pad/slice just in case a malformed string got in, ensuring equal length for timingSafeEqual.
    const isTokenValid = crypto.timingSafeEqual(
      Buffer.from(storedHash.padEnd(64, "0").slice(0, 64)),
      Buffer.from(hashedToken.padEnd(64, "0").slice(0, 64))
    );

    if (!user || !user.resetPasswordToken || !isTokenValid) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return NextResponse.json({ error: "Reset token has expired" }, { status: 400 });
    }

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown_ip";
    const userAgent = req.headers.get("user-agent") || "unknown_agent";
    
    await db.securityAuditLog.create({
      data: { userId: user.id, email: user.email, ipAddress, userAgent, action: "PASSWORD_RESET_VALIDATED" }
    });

    return NextResponse.json({ success: true, message: "Token is valid" });
  } catch (error) {
    console.error("Validate token error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
