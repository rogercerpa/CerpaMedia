# Consult Intake Upgrade - Migration Guide

## Preview URL
🔗 **Live Preview**: https://cerpamedia-web-git-cursor-consult-a2d7e8-roger-cerpas-projects.vercel.app/consult

## Pull Request
🔗 **GitHub PR**: https://github.com/rogercerpa/CerpaMedia/pull/16

---

## What Changed

### Required Fields (New/Updated)
1. **Phone Number** - NOW REQUIRED (was optional)
2. **Company Name** - NOW REQUIRED (was optional)
3. **Service Interest** - NEW REQUIRED field with 6 tech-focused options
4. **Challenge** - NOW REQUIRED with 40-500 character validation
5. **Platform Preference** - NOW REQUIRED (was optional)

### New Database Fields
- `serviceInterest` (String) - One of: `general`, `web_mobile`, `ai`, `automation`, `strategy`, `not_sure`
- `intakeAnswers` (Json?) - Stores optional branch questions + extras as JSON object

### Schema Changes Summary

```diff
model Booking {
  id               String    @id @default(cuid())
  startTime        DateTime
  endTime          DateTime
  status           String    @default("pending")
  customerName     String
  customerEmail    String
- customerPhone    String?
+ customerPhone    String              // NOW REQUIRED
- customerCompany  String?
+ customerCompany  String              // NOW REQUIRED
+ serviceInterest  String              // NEW REQUIRED
- platformPref     String?
+ platformPref     String              // NOW REQUIRED
+ intakeAnswers    Json?               // NEW OPTIONAL
  stripeSessionId  String?
  holdExpiresAt    DateTime?
  notes            String?   @db.Text  // NOW REQUIRED (40-500 chars client-side)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  @@index([status, startTime])
  @@index([customerEmail])
  @@index([holdExpiresAt])
+ @@index([serviceInterest])           // NEW
}
```

---

## Post-Merge Deployment Steps

### ⚠️ CRITICAL: Database Migration Required

After merging this PR to main, you MUST run a database migration on your Neon production database. This cannot be done automatically because the schema changes include making previously-optional fields required.

### Option 1: Quick Push (Simpler, Less Safe)

```bash
# In production environment with NEON connection string
npx prisma db push
```

**Warning**: This will attempt to make fields required immediately. If you have any existing `Booking` records with `NULL` values in `customerPhone`, `customerCompany`, or `platformPref`, the migration will fail.

### Option 2: Managed Migration (Recommended, Safer)

```bash
# Create migration file
npx prisma migrate dev --name add_required_consult_intake_fields

# Review the migration file in prisma/migrations/
# Edit if needed to handle existing NULL values

# Apply to production
npx prisma migrate deploy
```

### If You Have Existing Bookings with NULL Values

Before running the migration, clean up existing data:

```sql
-- Check for NULL values
SELECT id, customerName, customerEmail, customerPhone, customerCompany, platformPref, serviceInterest
FROM "Booking"
WHERE customerPhone IS NULL 
   OR customerCompany IS NULL 
   OR platformPref IS NULL 
   OR serviceInterest IS NULL;

-- Update NULL values with defaults (adjust as needed)
UPDATE "Booking"
SET 
  customerPhone = COALESCE(customerPhone, 'No phone provided'),
  customerCompany = COALESCE(customerCompany, 'Unknown'),
  platformPref = COALESCE(platformPref, 'Zoom'),
  serviceInterest = COALESCE(serviceInterest, 'general')
WHERE customerPhone IS NULL 
   OR customerCompany IS NULL 
   OR platformPref IS NULL 
   OR serviceInterest IS NULL;
```

---

## Testing Checklist (Before Merge)

Use the preview URL to test:

### Booking Flow
- [ ] Navigate to `/consult` on preview URL
- [ ] Verify slot selection works
- [ ] Complete intake form with all required fields
- [ ] Test each service interest option to see branch questions:
  - [ ] Technology Strategy Call (general)
  - [ ] Web & mobile applications
  - [ ] AI integration / AI consulting
  - [ ] Automation & process improvement
  - [ ] Strategy / architecture / roadmap
  - [ ] Not sure yet
- [ ] Verify branch questions are optional (can skip)
- [ ] Test challenge field validation:
  - [ ] Cannot submit with < 40 characters
  - [ ] Cannot submit with > 500 characters
  - [ ] Character counter updates in real-time
- [ ] Fill optional extras (role, website, urgency)
- [ ] Submit and complete Stripe checkout

### Admin View
- [ ] Log in to `/admin` on preview
- [ ] Navigate to Bookings
- [ ] Verify new card layout displays:
  - [ ] Customer phone and company
  - [ ] Service interest with human-friendly label
  - [ ] Full challenge text (not truncated)
  - [ ] Additional context section showing branch answers
  - [ ] Optional extras (if provided)

### Email & Webhook (Post-Payment)
- [ ] Check admin email for new booking
- [ ] Verify "For Consult Secretary Bot" section appears with formatted brief
- [ ] Check application logs/console for `[Consult Secretary Hook]` JSON output

---

## Consult Secretary Bot Integration

### Data Shape for Future Bot

The `toConsultBrief()` serializer in `src/lib/consult-brief.ts` provides a consistent interface:

```typescript
interface ConsultBrief {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany: string;
  serviceInterest: string;          // enum value: "web_mobile", "ai", etc.
  serviceInterestLabel: string;     // human label: "Web & mobile applications"
  challenge: string | null;         // The main problem/decision
  platform: string;                 // "Zoom" or "Microsoft Teams"
  slotStart: string;                // ISO 8601 timestamp
  slotEnd: string;                  // ISO 8601 timestamp
  timezone: string;                 // "America/New_York"
  intakeAnswers: Record<string, any> | null;  // Branch + optional fields
  paymentStatus: string;            // "confirmed", "pending", etc.
}
```

### Where Bot Can Access Data

1. **Stripe Webhook Logs**: Search for `[Consult Secretary Hook]` in application logs
2. **Admin Email**: Copy formatted brief from "For Consult Secretary Bot" section
3. **Database Query** (future): Create read-only API endpoint that returns `toConsultBrief(booking)`

### Example Bot Use Cases

**Pre-Call Brief Generation**:
```
Customer: Jane Smith from Acme Corp
Service: AI integration / AI consulting
Challenge: "Need to automate customer support but worried about data privacy"
Context:
  - ai_workflow: Customer support ticket routing
  - ai_tools: Zendesk, Intercom
  - ai_privacy: Yes (concerns about GDPR)
Scheduled: Wednesday, March 15, 2026 at 2:00 PM EST
Platform: Zoom
```

---

## Files Changed

### Modified
- `prisma/schema.prisma` - Schema updates for required fields + new fields
- `src/components/BookingFlow.tsx` - Enhanced intake form with conditional questions
- `src/app/api/booking/checkout/route.ts` - Validation for new required fields
- `src/app/api/webhooks/stripe/route.ts` - ConsultBrief logging and email integration
- `src/app/admin/bookings/page.tsx` - Redesigned card layout with all intake details

### Added
- `src/lib/consult-brief.ts` - Serializer and formatter for secretary bot integration

---

## Rollback Plan (If Needed)

If issues arise after deployment:

1. **Revert the PR merge**: 
   ```bash
   git revert <commit-sha>
   git push origin main
   ```

2. **Rollback database** (if you used `prisma migrate`):
   ```bash
   # Find the migration to rollback to
   npx prisma migrate status
   
   # Rollback is manual - you'll need to:
   # 1. Make fields nullable again
   # 2. Remove serviceInterest index
   # 3. Remove intakeAnswers column
   ```

3. **Quick Fix** (make fields optional again):
   ```prisma
   customerPhone    String?
   customerCompany  String?
   serviceInterest  String?
   platformPref     String?
   ```
   
   Then run `npx prisma db push` again.

---

## Support

For questions or issues:
- **GitHub PR**: https://github.com/rogercerpa/CerpaMedia/pull/16
- **Preview URL**: https://cerpamedia-web-git-cursor-consult-a2d7e8-roger-cerpas-projects.vercel.app/consult

---

## Success Metrics

After deployment and a few bookings, verify:
- ✅ Completion rate remains high (target: >80% of started intakes)
- ✅ Branch questions provide useful context (check admin emails)
- ✅ Challenge field gives Roger enough prep information
- ✅ No booking failures due to validation errors
- ✅ Admin can quickly prep for calls using new intake data
