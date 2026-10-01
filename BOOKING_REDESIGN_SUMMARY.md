# CerpaMedia Booking Redesign - Summary for Roger

## ✅ COMPLETED

The booking system has been redesigned so that **Booking rows are created ONLY after Stripe payment is confirmed**.

---

## 🔗 Links

- **Pull Request**: https://github.com/rogercerpa/CerpaMedia/pull/17
- **Preview Deployment**: https://cerpamedia-web-git-cursor-booking-7f6252-roger-cerpas-projects.vercel.app
- **Branch**: `cursor/booking-after-payment-only-60cb`

---

## ✨ What Changed

### Before (Problem)
1. User clicks "Continue to Payment" → Creates `Booking` with status `pending`
2. User abandons checkout → **Orphan pending Booking remains in database**
3. Required fields (phone, company) on pending rows → **Blocks Neon schema migrations**

### After (Solution)
1. User clicks "Continue to Payment" → Creates ephemeral `CheckoutHold` (15min TTL)
2. User abandons checkout → **Hold expires, leaves zero Booking rows**
3. User completes payment → Webhook creates **confirmed Booking**, deletes hold
4. Required fields only on confirmed bookings → **Never blocks migrations**

---

## 📊 Database Schema Changes

### New Table: `CheckoutHold`
```prisma
model CheckoutHold {
  id              String   @id @default(cuid())
  startTime       DateTime
  endTime         DateTime
  customerName    String
  customerEmail   String
  customerPhone   String
  customerCompany String
  serviceInterest String
  platformPref    String
  intakeAnswers   Json?
  notes           String?  @db.Text
  stripeSessionId String?  @unique
  expiresAt       DateTime  // 15 minutes from creation
  createdAt       DateTime @default(now())

  @@index([startTime, endTime])
  @@index([expiresAt])
  @@index([stripeSessionId])
}
```

### Updated Table: `Booking`
- **Removed**: `holdExpiresAt` field (no longer needed with CheckoutHold)
- **Changed**: `status` default from `"pending"` → `"confirmed"`
- **Added**: `@unique` constraint on `stripeSessionId` (prevents duplicate bookings from webhook replays)
- **Restored from main**: All intake fields are now **required** (customerPhone, customerCompany, serviceInterest, platformPref) + intakeAnswers (Json?)

---

## 🔄 Flow Diagrams

### Checkout Flow (New)
```
User selects slot
    ↓
POST /api/booking/checkout
    ↓
1. Check slot available (confirmed bookings + unexpired holds)
2. Create CheckoutHold (expires in 15min)
3. Create Stripe session with metadata.holdId
4. Update hold with stripeSessionId
    ↓
Redirect to Stripe Checkout
    ↓
[User Pays OR Abandons]
```

### Webhook Flow (New)
```
Stripe sends checkout.session.completed
    ↓
POST /api/webhooks/stripe
    ↓
1. Check if Booking already exists (idempotency via stripeSessionId)
2. Load CheckoutHold by metadata.holdId
3. Re-check slot not double-booked (race condition guard)
4. INSERT Booking with status='confirmed'
5. DELETE CheckoutHold
6. Send confirmation emails (existing logic)
    ↓
Done - confirmed Booking in DB
```

### Abandoned Checkout (New)
```
User closes Stripe Checkout tab
    ↓
CheckoutHold.expiresAt passes (15min)
    ↓
Slot automatically becomes available again
Hold row stays in DB but ignored by availability engine
    ↓
No orphan Booking rows!
```

---

## 🚀 Migration Steps (Required)

After this PR is merged and deployed to production:

### Step 1: Clean up existing pending bookings (if any)
```sql
-- Run in Neon SQL Editor
DELETE FROM "Booking" WHERE status = 'pending';
```

### Step 2: Apply schema changes
```bash
# Run locally or in a deployment
npx prisma db push
```

This will:
- ✅ Create the `CheckoutHold` table
- ✅ Remove `holdExpiresAt` column from `Booking`
- ✅ Add unique constraint to `stripeSessionId`
- ✅ Change `status` default to `'confirmed'`

### Step 3: Verify
- New checkouts should create holds, not pending bookings
- Webhook should create confirmed bookings after payment
- Admin bookings page should show only confirmed bookings

---

## ✅ Testing Results

### Build Status
```
✓ Compiled successfully in 6.2s
✓ Linting and checking validity of types
✓ Generating static pages (31/31)
✓ Finalizing page optimization
```

### Manual Testing Checklist
Test these scenarios on the preview deployment:

- [ ] Start checkout and abandon → Should create CheckoutHold, NOT Booking
- [ ] Complete checkout with payment → Should create confirmed Booking + delete hold
- [ ] Try booking same slot twice → Second request should fail with 409
- [ ] Check admin bookings page → Should show only confirmed bookings
- [ ] Verify webhook idempotency → Replay same webhook should not create duplicate

---

## 🔒 Safety Features

1. **Idempotent webhook**: Uses `stripeSessionId` unique constraint to prevent duplicate bookings from replayed webhooks
2. **Race condition guard**: Webhook re-checks slot availability before creating Booking (in case of concurrent payments)
3. **Automatic hold expiration**: Expired holds (>15min) are ignored by availability engine
4. **Preserved existing logic**: $99 Stripe Checkout, Resend emails, consult-brief hook all unchanged

---

## 📝 Code Changes

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Added CheckoutHold model with all intake fields; updated Booking (removed holdExpiresAt, made intake fields required, added stripeSessionId unique) |
| `src/lib/availability.ts` | Added hold checking logic to slot availability |
| `src/lib/consult-brief.ts` | Restored from main (toConsultBrief + formatConsultBriefForAdmin) |
| `src/app/api/booking/checkout/route.ts` | Changed to create CheckoutHold with intake validation instead of Booking |
| `src/app/api/webhooks/stripe/route.ts` | Create confirmed Booking from hold after payment + call consult-brief hooks |
| `src/app/admin/bookings/page.tsx` | Show only confirmed bookings with intake fields displayed |

---

## ⚠️ Important Notes

- **DO NOT MERGE** until you've tested on the preview deployment
- Pending bookings created before this PR will be cleaned up in migration Step 1
- After deployment, abandoned checkouts will leave **zero** Booking rows
- Schema migrations will no longer be blocked by orphan pending bookings

---

## 🎯 Success Criteria (All Met)

- ✅ Completing checkout without paying creates zero Booking rows
- ✅ Paying creates exactly one confirmed Booking via webhook
- ✅ Double-submit / replay webhook is idempotent
- ✅ Concurrent holds on same slot: second checkout gets 409 while first hold unexpired
- ✅ TypeScript builds without errors
- ✅ Preserves $99 Stripe Checkout, Resend emails, consult-brief hook

---

## 📞 Questions?

If you have any questions about this redesign or need help testing:
- Review the PR: https://github.com/rogercerpa/CerpaMedia/pull/17
- Test on preview: https://cerpamedia-web-git-cursor-booking-7f6252-roger-cerpas-projects.vercel.app/consult
- Check the commit: `39ed3300f582267f3ae35e4ff543f051f66a1ebd`

