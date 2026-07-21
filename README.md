# Willowbrook — Boutique Puppy Nursery

A warm, editorial website for a small breeder: browse available puppies by
breed, read about each pup, and send a reservation inquiry. A private admin
dashboard lets the breeder add/edit puppies (with photos) and read inquiries —
no code required.

Built with **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Prisma + SQLite**.

---

## Quick start

```bash
npm install          # installs deps + generates the Prisma client
npm run db:reset     # creates the SQLite database and seeds sample data
npm run dev          # start the dev server → http://localhost:3000
```

Then open:

- **Website** → http://localhost:3000
- **Breeder dashboard** → http://localhost:3000/admin

### Admin login (from `.env`)

| Field    | Value                     |
| -------- | ------------------------- |
| Email    | `admin@willowbrook.test`  |
| Password | `changeme123`             |

> Change these in `.env` and re-run `npm run db:seed` to apply a new password.

---

## What's inside

### Public site
- **Home** — hero, featured puppies, philosophy, breed grid, call-to-action
- **/puppies** — every puppy, filterable by breed and status
- **/puppies/[id]** — photo gallery, details, health notes, inquiry form
- **/breeds** and **/breeds/[slug]** — breed profiles with their current litters
- **/about** and **/contact** — story + a general inquiry form

### Admin dashboard (`/admin`, password-protected)
- **Overview** — counts and the latest inquiries
- **Puppies** — add, edit, feature, and remove listings with drag-order photos
- **Inquiries** — read messages, mark read/archived, reply by email

---

## How things fit together

| Area          | Where                                                     |
| ------------- | --------------------------------------------------------- |
| Data model    | `prisma/schema.prisma` (Breed, Puppy, Inquiry, AdminUser) |
| Sample data   | `prisma/seed.ts`                                          |
| Auth          | `src/lib/auth.ts` (signed cookie via `jose` + bcrypt)     |
| Admin actions | `src/app/admin/actions.ts` (server actions)               |
| Photo uploads | `src/app/api/admin/upload/route.ts` → `public/uploads/`   |
| Inquiry API   | `src/app/api/inquiries/route.ts`                          |
| Design tokens | `src/app/globals.css` (`@theme` block)                    |

Puppies without an uploaded photo show a deterministic illustrated portrait, so
the catalog always looks intentional. Upload a real photo and it takes over.

---

## Useful scripts

```bash
npm run dev        # dev server
npm run build      # production build (also runs prisma generate)
npm run start      # run the production build
npm run db:push    # apply schema changes to the database
npm run db:seed    # re-seed sample data
npm run db:reset   # wipe + recreate + seed
```

---

## Going to production (notes)

This starter uses SQLite and local file uploads, which are perfect for
development. Before deploying to a serverless host (e.g. Vercel):

1. **Database** — switch `datasource.provider` in `prisma/schema.prisma` to
   `postgresql` and point `DATABASE_URL` at a hosted Postgres (Neon, Supabase,
   etc.). Local SQLite files don't persist on serverless platforms.
2. **Image uploads** — swap the local filesystem write in
   `src/app/api/admin/upload/route.ts` for an object store (Vercel Blob, S3,
   Cloudflare R2). Serverless filesystems are ephemeral.
3. **Secrets** — set a long random `AUTH_SECRET` and a strong `ADMIN_PASSWORD`
   as environment variables on your host.
