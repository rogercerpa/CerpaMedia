# Milestone 1 Setup Guide

This guide explains how to set up the CerpaMedia booking system foundation (Milestone 1).

## What's Included in Milestone 1

✅ **Database Infrastructure**
- Neon Postgres with Prisma ORM
- Complete schema for services, availability, bookings, and admin auth
- Seed data with current services + Technology Strategy Call ($99, /consult)

✅ **Magic Link Admin Auth**
- Admin login via magic links sent to cerpamedia@gmail.com
- Email powered by Resend
- Session management with JWT tokens

✅ **Admin Dashboard**
- `/admin` home with navigation
- `/admin/services` - Read-only service list from database
- `/admin/availability` - Placeholder (coming in M2)
- `/admin/bookings` - Placeholder (coming in M3-M4)

✅ **Public Pages**
- `/consult` - Technology Strategy Call landing page
- Existing static pages preserved

## Required Environment Variables

Roger must set these in Vercel (or `.env` file for local dev):

### 1. DATABASE_URL (Required)
Your Neon Postgres connection string. Get it from: https://console.neon.tech

```
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

### 2. RESEND_API_KEY (Required for magic links)
Get your API key from: https://resend.com/api-keys

```
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxx"
```

**Note**: You'll also need to verify your domain in Resend, or use their test domain for development.

### 3. AUTH_SECRET (Required)
Generate a secure random secret:

```bash
openssl rand -base64 32
```

Then set:
```
AUTH_SECRET="your-generated-secret-here"
```

### 4. ADMIN_EMAIL (Optional - defaults to cerpamedia@gmail.com)
```
ADMIN_EMAIL="cerpamedia@gmail.com"
```

### 5. NEXT_PUBLIC_BASE_URL (Required for magic links)
- Development: `http://localhost:3000`
- Production: Your actual domain

```
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
```

## Important: Prisma 7 with PostgreSQL Adapter

This project uses **Prisma 7** with the PostgreSQL driver adapter (`@prisma/adapter-pg`). This means:
- The database connection uses the `pg` npm package
- Connection pooling is handled by `pg.Pool`
- This is required for Neon Postgres compatibility

The adapter is already configured in `src/lib/prisma.ts`.

## Database Setup

### Step 1: Run Migrations

After setting `DATABASE_URL`, run:

```bash
npx prisma migrate dev --name init
```

This creates all the necessary tables in your Neon database.

### Step 2: Seed Services

Populate the database with your services:

```bash
npm run db:seed
```

This adds:
- 7 existing services (Web Dev, AI Integration, etc.)
- Technology Strategy Call ($99, /consult)

### Step 3: Generate Prisma Client

```bash
npm run db:generate
```

Or this happens automatically on `npm install`.

## Testing Locally

1. Copy `.env.example` to `.env` and fill in your credentials
2. Run migrations: `npx prisma migrate dev --name init`
3. Seed data: `npm run db:seed`
4. Start dev server: `npm run dev`
5. Visit `http://localhost:3000/admin/login`
6. Enter `cerpamedia@gmail.com`
7. Check your email for the magic link (or console if `RESEND_API_KEY` is not set)

## Deploying to Vercel

### Step 1: Set Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and add:

- `DATABASE_URL` (your Neon connection string)
- `RESEND_API_KEY`
- `AUTH_SECRET`
- `ADMIN_EMAIL`
- `NEXT_PUBLIC_BASE_URL` (your production domain)

### Step 2: Deploy

```bash
git push origin cursor/milestone-1-foundation-51c3
```

Then merge the PR or deploy the branch directly in Vercel.

### Step 3: Run Migrations on Production

After the first deploy, run migrations against your Neon database:

```bash
# From your local machine with DATABASE_URL pointing to production
npx prisma migrate deploy
```

Or use Vercel's CLI:

```bash
vercel env pull .env.production.local
DATABASE_URL="your-production-db-url" npx prisma migrate deploy
```

### Step 4: Seed Production Data

```bash
DATABASE_URL="your-production-db-url" npm run db:seed
```

## What Works vs. What's Coming

### ✅ Works Now (M1)
- Database schema for all features
- Admin login with magic links
- Admin dashboard navigation
- Read-only services list in admin
- `/consult` booking page (contact form, no booking yet)
- All existing static pages preserved

### 🔜 Coming in M2
- Availability management UI
- Weekly schedule configuration
- Blocked dates management

### 🔜 Coming in M3-M4
- Full CMS for service editing
- Slot picker for consultations
- Stripe Checkout integration
- Booking confirmation emails
- Booking management UI

## Database Schema

### Service
- id, title, shortDesc, longDesc
- priceLabel, ctaLabel, ctaUrl
- sortOrder, published
- timestamps

### AvailabilityRule
- weekday (0-6), startTime, endTime, timezone
- For defining weekly available hours

### BlockedDate
- date, reason (optional)
- For marking days unavailable

### Booking
- startTime, endTime, status
- customerName, customerEmail, customerPhone, customerCompany
- platformPref (zoom|teams), stripeSessionId, notes
- timestamps

### Admin Auth Tables
- MagicLinkToken: For email-based login
- AdminSession: For maintaining admin sessions

## Troubleshooting

### "Cannot connect to database"
- Verify `DATABASE_URL` is correct
- Check Neon dashboard that database is active
- Ensure IP allowlist in Neon includes your deployment (Vercel IPs should be allowed by default)

### "Magic link not received"
- Check `RESEND_API_KEY` is set
- Verify domain is verified in Resend (or use test domain)
- Check spam folder
- For dev without Resend: Check console logs for the magic link URL

### "Unauthorized email address"
- Only `cerpamedia@gmail.com` (or value of `ADMIN_EMAIL`) can log in
- This is by design for M1

### "Prisma Client not generated"
- Run: `npm run db:generate`
- Happens automatically on `npm install`

## Next Steps After M1

1. Test admin login on production
2. Verify services display correctly in admin panel
3. Confirm `/consult` page renders properly
4. Plan M2: Availability management
5. Plan M3-M4: Booking flow + Stripe integration

## Support

For issues or questions:
- Email: cerpamedia@gmail.com
- Phone: (943) 248-7410
