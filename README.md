# Zoma Tech Store

Next.js 14 (App Router) e‑commerce storefront + admin dashboard.
Stack: Next.js 14 · Prisma + PostgreSQL · NextAuth (credentials) · Cloudinary · Zustand · CSS Modules.

## Local development

```bash
npm install
cp .env.example .env        # fill in the values (see below)
npx prisma migrate deploy   # create the schema
npm run db:seed             # demo data + admin user
npm run dev                 # http://localhost:3000
```

Seeded admin: `admin@zomatech.com` / `password123` — change it immediately in production.

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string (Neon, Supabase, Vercel Postgres, RDS…) |
| `NEXTAUTH_SECRET` | yes | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | yes | Full site URL, no trailing slash |
| `NEXT_PUBLIC_APP_URL` | yes | Same public URL, used for metadata/sitemap |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | yes for admin image upload | Cloudinary dashboard |

## Deploying to Vercel

1. **Create a PostgreSQL database** (Neon or Vercel Postgres) and copy the pooled connection string.
2. **Import the GitHub repo** into Vercel — the framework preset is detected automatically. No custom build command is needed: `npm run build` already runs `prisma generate`.
3. **Add the environment variables** above under Settings → Environment Variables (Production + Preview). Set `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` to the final domain.
4. **Run the migrations against the production database** once, from your machine:
   ```bash
   DATABASE_URL="<production url>" npx prisma migrate deploy
   DATABASE_URL="<production url>" npm run db:seed   # optional: demo data
   ```
5. **Deploy**, then add the custom domain in Vercel and update `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` to match, and redeploy.
6. **Post-deploy checklist:** sign in to `/admin`, change the admin password, upload a product image (verifies Cloudinary), and place a test order (verifies checkout + stock decrement).

Storefront pages are ISR with a 60 second revalidation window, so catalog edits show up within a minute without a redeploy.
