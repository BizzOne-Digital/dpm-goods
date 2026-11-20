# Universal UPMGoods: Direct Primary Merchandises LLC

A custom fashion e-commerce site built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, MongoDB Atlas and Mongoose. It is designed to run on Vercel or any other serverless host.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in MONGODB_URI, ADMIN_SESSION_SECRET, SEED_ADMIN_*
npm run seed                 # demo products/content + first admin (owner)
npm run dev                  # http://localhost:3000  ·  admin: /admin
```

If `MONGODB_URI` isn't set, the storefront shows read-only demo data so you can review the design. The admin, checkout and accounts need a database.

| Script | Purpose |
| --- | --- |
| `npm run seed` | Adds the demo catalog, page content and settings, and creates the admin from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. It's safe to run again. |
| `npm run seed -- --clear` | Removes the demo records |
| `npm run typecheck` / `npm run build` | Checks types / builds for production |

## Environment variables

| Variable | Notes |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `ADMIN_SESSION_SECRET` | A random string of 32+ characters that signs admin and customer sessions. Required in production. |
| `NEXT_PUBLIC_SITE_URL` | Used for the canonical URL, sitemap and payment redirects |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Optional. Turn on Stripe Checkout. Without them, orders are created as `pending` (manual payment confirmation). Webhook endpoint: `/api/payments/stripe/webhook` |

## Architecture

- `src/app/(site)` holds the public storefront. Every route has its own page.
- `src/app/admin` holds the admin panel. `/admin/login` is public. Everything under `(panel)` is checked on the server with `requireAdminPage()`.
- `src/app/api` holds the route handlers. Every admin mutation calls `requireAdmin()` and validates input with Zod.
- `src/lib/data.ts` contains all storefront DB reads. UI components never query the database directly.
- `src/lib/admin/resources.ts` holds one config per admin section. Each config drives the table, the form and the server-side validation.
- `src/lib/i18n` contains the English and Spanish dictionaries. The language is stored in a cookie, so switching keeps the visitor on the current page. Database content (products, posts) is shown in the language it was entered in.

## Image storage (Vercel-safe)

Uploads never touch the filesystem.

1. `POST /api/upload` (admin only, Node runtime) checks the folder (`products|gallery|pages|misc`), the file type (JPG, PNG, WebP, GIF) and the size (8 MB max). It stores the bytes in MongoDB (`StoredUpload`) and returns `/api/uploads/{folder}/{filename}`.
2. `GET /api/uploads/[folder]/[filename]` serves the image with a one-year immutable cache header. It rejects path traversal.
3. Documents store **only URLs**.
4. Replacing or removing an image works like this: the new image uploads first, then the document saves, and only then is the old upload deleted. An upload is kept if another document still references it (for example, a duplicated product). External Unsplash URLs are never deleted.
5. Old `/uploads/...` links show a placeholder (`lib/image-url.ts`).
6. The **Media** page in the admin lists stored files, filters them by folder and warns before deleting an image that is still in use.

## Order flow

At checkout, the server recalculates prices, stock, the promo code, shipping and tax, and holds the stock. It then creates the order (`pending`) and starts payment. Admins move orders through `pending → paid → processing → shipped → delivered`. Setting an order to `cancelled` or `refunded` returns the items to stock.

## Deploying to Vercel

1. Import the repo into Vercel and set the environment variables listed above.
2. In MongoDB Atlas, under Network Access, allow Vercel to connect (or use the Atlas Vercel integration).
3. Run `npm run seed` once against the production database, from your computer, using the production `MONGODB_URI`.
4. Log in at `/admin` and change the seeded admin password under **Admin Settings**.
