import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// ── Login attempt tracking (in-memory, per-process) ───────────────────────
// After MAX_ATTEMPTS failures the IP is locked for LOCKOUT_MS
const MAX_ATTEMPTS = 10;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

interface Attempt { count: number; lockedUntil: number | null }
const loginAttempts = new Map<string, Attempt>();

function checkLoginAttempt(ip: string): { blocked: boolean; remaining: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (entry?.lockedUntil && now < entry.lockedUntil) {
    return { blocked: true, remaining: 0 };
  }

  const count = (entry?.lockedUntil && now >= entry.lockedUntil) ? 0 : (entry?.count ?? 0);
  return { blocked: false, remaining: MAX_ATTEMPTS - count };
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  // Reset if previous lockout has expired
  const count = (entry?.lockedUntil && now >= entry.lockedUntil)
    ? 1
    : (entry?.count ?? 0) + 1;

  const lockedUntil = count >= MAX_ATTEMPTS ? now + LOCKOUT_MS : null;
  loginAttempts.set(ip, { count, lockedUntil });
}

function recordSuccessfulLogin(ip: string) {
  loginAttempts.delete(ip);
}

// Cleanup stale entries every 30 min
setInterval(() => {
  const now = Date.now();
  Array.from(loginAttempts.entries()).forEach(([ip, entry]) => {
    if (!entry.lockedUntil || now > entry.lockedUntil + LOCKOUT_MS) {
      loginAttempts.delete(ip);
    }
  });
}, 30 * 60 * 1000);

// ── NextAuth options ──────────────────────────────────────────────────────
export const authOptions: NextAuthOptions = {
  // @ts-ignore — adapter type mismatch between @auth/prisma-adapter v2 and next-auth v4
  adapter: PrismaAdapter(prisma),

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        ip: { label: "IP", type: "text" }, // forwarded from sign-in call
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const ip = credentials.ip ?? "unknown";

        // Lockout check
        const { blocked } = checkLoginAttempt(ip);
        if (blocked) {
          throw new Error("Too many failed attempts. Try again in 15 minutes.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user?.password) {
          recordFailedAttempt(ip);
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          recordFailedAttempt(ip);
          throw new Error("Invalid credentials");
        }

        recordSuccessfulLogin(ip);

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },

  pages: { signIn: "/login" },
  session: { strategy: "jwt" },

  // NEXTAUTH_SECRET must be set in .env — no fallback
  secret: process.env.NEXTAUTH_SECRET,
};
