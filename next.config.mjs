/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Stop MIME sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Referrer policy
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Permissions policy — disable unused browser APIs
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Force HTTPS for 1 year (enable after confirming HTTPS is live)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Content Security Policy
  // - default-src 'self': everything same-origin by default
  // - script-src: Next.js needs 'unsafe-inline' for its runtime chunks
  // - style-src: Google Fonts inline styles need 'unsafe-inline'
  // - img-src: allow Unsplash, local uploads, and data URIs
  // - font-src: allow Google Fonts CDN
  // - connect-src: allow Next.js HMR in dev + same-origin API calls
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  // ── Images ────────────────────────────────────────────────────────────────
  images: {
    // Modern formats — avif first for best compression
    formats: ["image/avif", "image/webp"],
    // Responsive breakpoints
    deviceSizes: [375, 640, 768, 1024, 1280, 1536],
    imageSizes: [48, 96, 128, 256, 384],
    // Allowed external image origins
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // ── Security Headers ──────────────────────────────────────────────────────
  async headers() {
    return [
      {
        // Apply to every route
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  // ── Redirects ────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Prevent directory listing of uploads (belt-and-suspenders)
      {
        source: "/uploads",
        destination: "/",
        permanent: false,
      },
    ];
  },

  // ── Build ─────────────────────────────────────────────────────────────────
  // Disable the X-Powered-By: Next.js response header
  poweredByHeader: false,

  // Strict mode catches potential issues early
  reactStrictMode: true,

  // Compress responses with gzip/brotli
  compress: true,
};

export default nextConfig;
