import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Log the message server-side (in production, send to an email service here)
    console.log("=== New Contact Form Submission ===");
    console.log(`Name:    ${name}`);
    console.log(`Email:   ${email}`);
    console.log(`Phone:   ${phone || "—"}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    console.log("===================================");

    // TODO: integrate an email service (e.g. Resend, SendGrid, Nodemailer)
    // to forward this message to info@zomatech.com

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
