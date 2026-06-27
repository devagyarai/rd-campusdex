import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validations";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { email } = validation.data;
    const ipAddress = req.headers.get("x-forwarded-for") || "unknown_ip";
    const userAgent = req.headers.get("user-agent") || "unknown_agent";
    const start = Date.now();
    
    // Rate Limiting Check
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const [ipCount, emailCount] = await Promise.all([
      db.securityAuditLog.count({
        where: { ipAddress, action: "PASSWORD_RESET_REQUESTED", timestamp: { gte: oneHourAgo } }
      }),
      db.securityAuditLog.count({
        where: { email, action: "PASSWORD_RESET_REQUESTED", timestamp: { gte: oneHourAgo } }
      })
    ]);

    if (ipCount >= 10 || emailCount >= 5) {
      await db.securityAuditLog.create({
        data: { email, ipAddress, userAgent, action: "PASSWORD_RESET_RATE_LIMITED" }
      });
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const user = await db.user.findUnique({ where: { email } });

    // Always log the request
    await db.securityAuditLog.create({
      data: { userId: user?.id, email, ipAddress, userAgent, action: "PASSWORD_RESET_REQUESTED" }
    });

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({ 
      success: true, 
      message: "If an account exists with this email, a password reset link has been sent." 
    });

    if (!user) {
      const elapsed = Date.now() - start;
      const delay = Math.max(0, 2000 - elapsed);
      await new Promise(r => setTimeout(r, delay));
      return successResponse;
    }

    // Generate secure token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const token = `${user.id}.${rawToken}`;
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expiresAt,
      }
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/${token}`;
    await sendPasswordResetEmail(email, resetUrl);
    
    await db.securityAuditLog.create({
      data: { userId: user.id, email, ipAddress, userAgent, action: "PASSWORD_RESET_EMAIL_SENT" }
    });

    const elapsed = Date.now() - start;
    const delay = Math.max(0, 2000 - elapsed);
    await new Promise(r => setTimeout(r, delay));

    return successResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
