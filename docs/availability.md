# Availability System Documentation

## Problem

**Symptom:** Admin portal (`/admin/availability`) shows 0 scheduled dates, but customers at `/consult` see 45 booking slots (Mon-Fri, 10 AM - 3:30 PM ET).

**Root Cause:** The availability system had two data sources:
1. **DateAvailability** — date-specific hours (managed via admin UI)
2. **AvailabilityRule** — legacy weekly recurring rules (hidden from admin)

When no DateAvailability records existed, the public booking API automatically fell back to AvailabilityRule. Roger had zero DateAvailability records but old weekly rules remained in the database, causing the mismatch.

---

## Solution

### 1. Core Fix: Remove AvailabilityRule Fallback

**Files changed:**
- `src/lib/availability.ts` — Removed automatic fallback to AvailabilityRule
- `src/app/api/booking/slots/route.ts` — Added `force-dynamic` to prevent stale caching

**New behavior:**  
Only DateAvailability records create customer-visible slots. Default = NO availability unless explicitly added.

### 2. Unified Admin Interface

**Replaced multi-tab UI with one unified screen:**

**Old (7 tabs):**
- Single Date, Multi-Select, Date Range, Weekly Pattern, Block Holidays, Manage Dates, Settings

**New (one screen):**
- Month calendar (click dates to open/block)
- Weekly template (bulk-creates DateAvailability rows, NOT a fallback)
- Exceptions & blocks list (all records in one place)
- "What Customers See" preview (next 10 bookable slots)
- Settings modal

**Files:**
- `src/components/UnifiedAvailabilityManager.tsx` (new)
- `src/app/admin/availability/page.tsx` (updated to use unified component)

### 3. Mobile Calendar Fix

**Issues fixed:**
- Month title no longer wraps on narrow screens
- Previous/Next buttons are equal-sized chevron icons (44x44px)
- Everything vertically centered
- Responsive at 360px, 390px, 414px widths

**File:** `src/components/CalendarBookingFlow.tsx`

### 4. Data Models

**Used by application:**
- **DateAvailability** — Date-specific hours (ONLY source of customer slots)
- **BlockedDate** — Blocked dates (holidays, out-of-office)
- **BookingSettings** — Slot length, buffer, min lead time
- **Booking** — Confirmed bookings (blocks slots)
- **CheckoutHold** — Temporary holds during checkout

**Unused (legacy):**
- **AvailabilityRule** — Weekly rules (no longer read by app, kept in DB)

---

## Migration Options

⚠️ **Option C (keep AvailabilityRule unused) is the default.** Do NOT delete anything without approval.

| Option | What Happens | Customer Slots | Action |
|--------|--------------|----------------|--------|
| **C. Keep Unused (Default)** | Leave AvailabilityRule in database | 0 (app ignores them) | None |
| **A. Delete Rules** | Remove all AvailabilityRule records | 0 until dates added | See scripts/migrations/optional-cleanup-availability-rules.sql |
| **B. Migrate to Dates** | Convert to 90 days of DateAvailability | Current slots for 90 days | See scripts/migrations/migrate-rules-to-dates.ts |

**Migration scripts in `scripts/migrations/` are NOT RUN automatically.** They are for reference only.

---

## Testing

### Unit Tests

**File:** `src/lib/availability.test.ts`

Tests cover:
- Empty config returns 0 slots
- Legacy weekly rules present but no dates => 0 slots (verifies fallback removed)
- Opened date creates slots in ET timezone
- Blocked date returns no slots
- Min lead time respected

**Run:** `npm test`

### Manual Testing Checklist

**Admin (`/admin/availability`):**
- [ ] Calendar displays current month
- [ ] Click date opens modal with Open/Block options
- [ ] Save date creates DateAvailability record
- [ ] "What Customers See" preview updates immediately
- [ ] Exceptions list shows all records
- [ ] Delete removes record and updates preview
- [ ] Weekly template bulk-creates DateAvailability rows
- [ ] Settings modal saves BookingSettings

**Public (`/consult`):**
- [ ] Empty state: Calendar shows "No available time slots"
- [ ] After adding date: Calendar highlights date
- [ ] Click date: Shows time slots
- [ ] Mobile (360-414px): Header doesn't wrap, buttons equal size

---

## Database Configuration

### Production vs Preview

**Vercel Preview Environment:**

To check if preview uses production database:
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Look for `DATABASE_URL` configuration
3. Check if it's set for "Preview" deployments

**If preview uses production DB:**
- ⚠️ **DO NOT** test write operations (add/delete dates) on preview
- Any changes will modify production data
- Use local development environment for testing

**Local Development:**

Use Docker Postgres or a throwaway Neon database:
```bash
# .env.local
DATABASE_URL="postgresql://user:pass@localhost:5432/cerpamedia_dev"
```

Never point local dev at production DATABASE_URL.

---

## Configuration

**Current settings (inferred from API behavior):**
- Slot length: 45 minutes
- Buffer: 30 minutes
- Min lead time: 24 hours
- Timezone: America/New_York

**Adjustable in admin Settings modal.**

---

## Decisions Needed

1. **Migration option:** Keep AvailabilityRule unused (C), delete (A), or migrate (B)?
2. **Slot length:** Keep 45 min or change to 60 min?
3. **Min lead time:** Keep 24 hrs or increase to 48 hrs?
4. **Booking window:** Keep unlimited or limit to X days ahead?

---

## Files Changed

```
docs/availability.md                       (this file)
docs/tab-inventory.md                      (old tab documentation)
scripts/migrations/migrate-rules-to-dates.ts
scripts/migrations/optional-cleanup-availability-rules.sql
scripts/migrations/optional-migrate-rules-to-dates.sql
src/app/admin/availability/page.tsx
src/app/api/booking/slots/route.ts
src/components/AvailabilityPreview.tsx     (new)
src/components/CalendarBookingFlow.tsx
src/components/UnifiedAvailabilityManager.tsx (new)
src/lib/availability.ts
src/lib/availability.test.ts               (new)
```

---

## Rollback

If issues arise:
1. Revert PR via GitHub UI
2. If Option A was executed, restore AvailabilityRule from backup
3. Verify production API returns slots

**Backup command (before any migration):**
```sql
COPY (SELECT * FROM "AvailabilityRule") TO '/tmp/availability_rules_backup.csv' CSV HEADER;
```

---

## Support

- **PR:** https://github.com/rogercerpa/CerpaMedia/pull/32
- **Production:** https://cerpamedia.com
- **Admin:** https://cerpamedia.com/admin/availability
