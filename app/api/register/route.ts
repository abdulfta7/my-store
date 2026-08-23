import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// ── Validation helpers ────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateInput(name: unknown, email: unknown, password: unknown, phone?: unknown) {
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) return "All fields must be strings";
  
  if (phone !== undefined && phone !== "" && typeof phone !== "string") return "Phone must be a string";

  const n = name.trim();
  const e = email.trim().toLowerCase();
  const p = password;

  if (!n || n.length < 2) return "Name must be at least 2 characters";
  if (n.length > 60) return "Name must be 60 characters or fewer";
  if (!EMAIL_RE.test(e)) return "Invalid email address";
  if (e.length > 254) return "Email address too long";
  if (p.length < 8) return "Password must be at least 8 characters";
  if (p.length > 72) return "Password must be 72 characters or fewer";

  // At least one letter and one number
  if (!/[a-zA-Z]/.test(p)) return "Password must contain at least one letter";
  if (!/\d/.test(p)) return "Password must contain at least one number";

  return null; // valid
}

export async function POST(req: Request) {
  // ── Rate limit: 5 registrations per 10 min per IP ──────────────────────
  const ip = getClientIp(req);
  const { allowed } = rateLimit(ip, "register", 5, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { message: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const { name, email, password, phone } = body;

    const validationError = validateInput(name, email, password, phone);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const cleanEmail = (email as string).trim().toLowerCase();
    const cleanName = (name as string).trim();
    const cleanPhone = (phone as string)?.trim() || null;

    // Always hash + query in constant time to prevent timing-based email enumeration
    const [existingUser, existingPhone, hashedPassword] = await Promise.all([
      prisma.user.findUnique({ where: { email: cleanEmail } }),
      cleanPhone ? prisma.user.findUnique({ where: { phone: cleanPhone } }) : Promise.resolve(null),
      bcrypt.hash(password, 12), // cost 12 — ~250ms, good balance
    ]);

    if (existingUser) {
      // Return same 201 as success to prevent email enumeration
      return NextResponse.json(
        { message: "If this email is new, your account has been created." },
        { status: 201 }
      );
    }
    
    if (existingPhone) {
      return NextResponse.json(
        { message: "Phone number is already in use." },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: { name: cleanName, email: cleanEmail, phone: cleanPhone, password: hashedPassword, role: "CUSTOMER" },
    });

    return NextResponse.json(
      { message: "Account created successfully", user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
