import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const role = token?.role as string | undefined;

    // --- Admin route guard ---
    // Allow only ADMIN and SUPER_ADMIN
    if (pathname.startsWith("/admin")) {
      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        // Authenticated but wrong role → send to home with a message
        const url = req.nextUrl.clone();
        url.pathname = "/";
        url.searchParams.set("error", "unauthorized");
        return NextResponse.redirect(url);
      }
    }

    // --- Admin API guard ---
    if (pathname.startsWith("/api/admin")) {
      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { error: "Forbidden: admin access required" },
          { status: 403 }
        );
      }
    }

    // All other protected routes (/account/*) just need a valid session,
    // which withAuth already enforces via the `authorized` callback below.
    return NextResponse.next();
  },
  {
    callbacks: {
      // Return true to allow the request through to the middleware function above.
      // Return false to redirect to the signIn page (defined in authOptions).
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;

        // /account/* and /admin/* require a session
        if (
          pathname.startsWith("/account") ||
          pathname.startsWith("/admin") ||
          pathname.startsWith("/api/admin")
        ) {
          return !!token;
        }

        // Every other route is public
        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Matcher: run middleware on account, admin pages and admin API routes.
// Exclude Next.js internals and static assets so they are never intercepted.
export const config = {
  matcher: [
    "/account/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
