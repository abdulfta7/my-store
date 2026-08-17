import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import crypto from "crypto";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: Request) {
  // Rate limit: 3 requests per 15 min per IP
  const ip = getClientIp(req);
  const { allowed } = rateLimit(ip, "forgot-password", 3, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  try {
    const { email } = await req.json().catch(() => ({}));
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Always return success — never reveal whether email exists (prevents enumeration)
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (user) {
      // Invalidate any previous unused tokens for this email
      await prisma.passwordResetToken.updateMany({
        where: { email: cleanEmail, used: false },
        data: { used: true },
      });

      const token = crypto.randomBytes(32).toString("hex");
      await prisma.passwordResetToken.create({
        data: {
          token,
          email: cleanEmail,
          expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
        },
      });

      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

      // TODO: send via email service (Resend, SendGrid, Nodemailer)
      // For now, log to console — replace with real email send in production
      console.log("=== PASSWORD RESET LINK ===");
      console.log(`To: ${cleanEmail}`);
      console.log(`Link: ${resetUrl}`);
      console.log("===========================");
    }

    // Same response whether user exists or not
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
