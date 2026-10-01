# Milestone 3 Environment Variables

This document describes the environment variables required for the M3 booking flow with Stripe Checkout integration.

## Required Environment Variables

### Stripe Configuration

#### `STRIPE_SECRET_KEY` (Required)
Your Stripe secret key for server-side API operations.
- Get from: https://dashboard.stripe.com/apikeys
- Format: `sk_test_...` (test) or `sk_live_...` (production)
- Used for: Creating checkout sessions, processing webhooks

#### `STRIPE_WEBHOOK_SECRET` (Required)
Webhook signing secret to verify incoming Stripe webhook events.
- Get from: https://dashboard.stripe.com/webhooks
- Format: `whsec_...`
- Used for: Verifying webhook signatures for security
- Setup: Create a webhook endpoint pointing to `https://yourdomain.com/api/webhooks/stripe`
- Events to subscribe: `checkout.session.completed`

#### `STRIPE_PRICE_ID` (Optional)
Pre-created Stripe Price ID for the Technology Strategy Call product.
- Get from: https://dashboard.stripe.com/products
- Format: `price_...`
- If not provided: The system will use inline price_data with $99.00 USD hardcoded
- Recommended: Create a Price in Stripe dashboard for better tracking

### Application Configuration

#### `NEXT_PUBLIC_BASE_URL` (Recommended)
The base URL of your application.
- Format: `https://cerpamedia.com` (no trailing slash)
- Default: `http://localhost:3000` (development)
- Used for: Stripe Checkout success/cancel redirect URLs

### Email Configuration (Existing)

#### `RESEND_API_KEY` (Required)
Resend API key for sending confirmation emails.
- Get from: https://resend.com/api-keys
- Already configured for magic links and contact form

#### `CONTACT_FROM_EMAIL` (Optional)
Email address to send from.
- Default: `onboarding@resend.dev`
- Recommended: Use verified domain email

#### `CONTACT_TO_EMAIL` (Optional)
Admin email address for booking notifications.
- Default: `cerpamedia@gmail.com`

### Database Configuration (Existing)

#### `DATABASE_URL`
PostgreSQL connection string (already configured for M2).

## Vercel Deployment Setup

1. Add environment variables in Vercel project settings:
   - Go to: Project Settings → Environment Variables
   - Add all required variables
   - Mark sensitive keys (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET) as sensitive

2. Set up Stripe webhook:
   - After deploying to Vercel, note your production URL
   - In Stripe Dashboard → Webhooks, create new endpoint
   - URL: `https://cerpamedia.com/api/webhooks/stripe`
   - Select event: `checkout.session.completed`
   - Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET` in Vercel

3. Optional: Create Stripe Price
   - In Stripe Dashboard → Products, create "Technology Strategy Call"
   - Set price to $99.00 USD, one-time payment
   - Copy Price ID to `STRIPE_PRICE_ID` in Vercel

## Local Development

Create a `.env.local` file in the project root:

```bash
# Stripe (test mode keys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_... # Optional

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Email (existing)
RESEND_API_KEY=re_...
CONTACT_FROM_EMAIL=onboarding@resend.dev
CONTACT_TO_EMAIL=cerpamedia@gmail.com

# Database (existing)
DATABASE_URL=postgresql://...
```

### Testing Webhooks Locally

Use Stripe CLI to forward webhooks to your local server:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret displayed and set it in .env.local
STRIPE_WEBHOOK_SECRET=whsec_...

# Test with:
stripe trigger checkout.session.completed
```

## Database Migration

M3 adds a new field to the Booking model:
- `holdExpiresAt` (DateTime, optional) - Timestamp when soft hold expires

Run migration after pulling M3 changes:

```bash
npm run db:push
```

## Testing the Flow

1. **Slot Selection**: Visit `/consult` and select an available time
2. **Intake Form**: Fill in customer details and platform preference
3. **Checkout**: Click "Continue to Payment" to create Stripe session
4. **Payment**: Complete test payment (use card `4242 4242 4242 4242`)
5. **Webhook**: Stripe triggers webhook → booking status changes to "confirmed"
6. **Emails**: Customer and admin receive confirmation emails
7. **Success Page**: Customer redirected to `/consult/success`

## Architecture Notes

### Soft Holds
- Pending bookings are held for 15 minutes
- `holdExpiresAt` timestamp prevents double-booking during checkout
- Expired pending holds are excluded from availability calculations
- On successful payment (webhook), status changes to "confirmed"

### Payment Flow
1. Customer submits booking form
2. System creates pending Booking record with `holdExpiresAt`
3. System creates Stripe Checkout session with `bookingId` in metadata
4. Customer redirected to Stripe-hosted checkout
5. On successful payment, Stripe sends webhook
6. Webhook handler updates booking status to "confirmed"
7. System sends confirmation emails to customer and admin

### Security
- Webhook signatures verified with `STRIPE_WEBHOOK_SECRET`
- No Stripe keys exposed to client (all server-side)
- Idempotent webhook handling (duplicate events ignored)

## Fallback Behavior

If Stripe keys are not configured:
- `/consult` page still shows booking UI
- Checkout will fail with clear error message
- Existing payment link env vars (`NEXT_PUBLIC_STRIPE_PAYMENT_LINK`) are not used by M3 flow

For production, Stripe Checkout is preferred over bare Payment Links for:
- Better UX with intake form before payment
- Soft holds to prevent double-booking
- Automatic webhook integration
- Email confirmation with booking details
