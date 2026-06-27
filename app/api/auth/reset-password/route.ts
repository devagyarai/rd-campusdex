import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validations";
import crypto from "crypto";
import { sendPasswordChangedEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { token: fullToken, password } = validation.data;
    const ipAddress = req.headers.get("x-forwarded-for") || "unknown_ip";
    const userAgent = req.headers.get("user-agent") || "unknown_agent";

    if (!fullToken || !fullToken.includes(".")) {
      await db.securityAuditLog.create({
        data: { ipAddress, userAgent, action: "PASSWORD_RESET_FAILED" }
      });
      return NextResponse.json({ error: "Invalid token format" }, { status: 400 });
    }

    const [userId, rawToken] = fullToken.split(".");

    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    // Dummy hash comparison to mask timing
    const dummyHash = crypto.createHash("sha256").update("dummy").digest("hex");
    const storedHash = user?.resetPasswordToken || dummyHash;

    const isTokenValid = crypto.timingSafeEqual(
      Buffer.from(storedHash.padEnd(64, "0").slice(0, 64)),
      Buffer.from(hashedToken.padEnd(64, "0").slice(0, 64))
    );

    if (!user || !user.resetPasswordToken || !isTokenValid) {
      await db.securityAuditLog.create({
        data: { ipAddress, userAgent, action: "PASSWORD_RESET_FAILED" }
      });
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      await db.securityAuditLog.create({
        data: { userId: user.id, email: user.email, ipAddress, userAgent, action: "PASSWORD_RESET_EXPIRED" }
      });
      return NextResponse.json({ error: "Reset token has expired" }, { status: 400 });
    }

    // Prevent Password Reuse
    const isSame = await bcrypt.compare(password, user.password);
    if (isSame) {
      return NextResponse.json({ error: "New password cannot be the same as the current password." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        lastPasswordReset: new Date(),
        sessionVersion: { increment: 1 }
      },
    });

    await sendPasswordChangedEmail(user.email);

    await db.securityAuditLog.create({
      data: { userId: user.id, email: user.email, ipAddress, userAgent, action: "PASSWORD_RESET_SUCCESS" }
    });

    return NextResponse.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
