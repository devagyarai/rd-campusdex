import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log("\n=== PASSWORD RESET EMAIL (Dev Mode) ===");
    console.log(`To: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log("=======================================\n");
    return;
  }

  try {
    await resend.emails.send({
      from: "RD CampusDex Security <security@rdcampusdex.com>",
      to: email,
      subject: "Reset Your RD CampusDex Password",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.5; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #030712;">Password Reset Request</h2>
          <p>You requested a password reset for RD CampusDex.</p>
          
          <p style="margin: 20px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Reset Password
            </a>
          </p>
          
          <p>This link will expire in 15 minutes.</p>
          <p>If you did not request this password reset,<br/>please ignore this email.</p>
          <p><strong>For security reasons, never share this link<br/>with anyone.</strong></p>
          
          <hr style="margin-top: 40px; border: none; border-top: 1px solid #eaeaea;" />
          <p style="color: #6b7280; font-size: 14px;">RD CampusDex Security Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send reset email:", error);
  }
}

export async function sendPasswordChangedEmail(email: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log("\n=== PASSWORD CHANGED EMAIL (Dev Mode) ===");
    console.log(`To: ${email}`);
    console.log("Subject: Your RD CampusDex Password Was Changed");
    console.log("=========================================\n");
    return;
  }

  try {
    await resend.emails.send({
      from: "RD CampusDex Security <security@rdcampusdex.com>",
      to: email,
      subject: "Your RD CampusDex Password Was Changed",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.5; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #030712;">Password Changed Successfully</h2>
          <p>Your RD CampusDex password was successfully changed.</p>
          <p>If you did not perform this action,<br/>please contact support immediately.</p>
          
          <hr style="margin-top: 40px; border: none; border-top: 1px solid #eaeaea;" />
          <p style="color: #6b7280; font-size: 14px;">RD CampusDex Security Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send password changed email:", error);
  }
}
