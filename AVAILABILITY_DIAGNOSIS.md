# Availability System Diagnosis — CerpaMedia

**Date:** October 8, 2026  
**Issue:** Admin shows NO availability, but public booking shows weekday slots

---

## Root Cause (Plain English)

**The booking system has two ways to decide when Roger is available:**

1. **Date-specific hours** — Roger manually adds specific dates (e.g., "October 15th, 10 AM - 4 PM")
2. **Weekly recurring hours** — Old system that says "every Monday, Tuesday, etc. from X to Y"

**What's happening:**

- Roger has **zero** date-specific hours in the admin portal (the new system from PRs #14 and #15)
- But the database still has **weekly recurring hours** from the old system (weekdays 10 AM - 4 PM ET)
- When the public booking page finds no date-specific hours, it **falls back** to the old weekly rules
- This is why customers see availability even though Roger's admin shows nothing

**The slot logic in `src/lib/availability.ts` (lines 426-430):**
```typescript
} else if (rules.length > 0) {  // ← Falls back to weekly rules
  const weekday = getWeekdayInTimezone(currentDate, timezone);
  const dayRules = rules.filter((r) => r.weekday === weekday);
```

---

## Evidence

### Public API (Oct 8, 2026)
```bash
curl 'https://cerpamedia.com/api/booking/slots?start=2026-10-08T...'
```

**Returns:** 45 slots over 2 weeks
- **Dates:** Oct 12-22 (Mon-Fri only, skips weekends)
- **Times:** 10:00 AM - 3:30 PM ET (5 slots per day)
- **Slot length:** 45 minutes
- **Buffer:** 30 minutes

**Sample slots (UTC):**
```json
{
  "count": 45,
  "slots": [
    {"start":"2026-10-12T14:00:00.000Z","end":"2026-10-12T14:45:00.000Z"},
    {"start":"2026-10-12T15:15:00.000Z","end":"2026-10-12T16:00:00.000Z"},
    ...
  ]
}
```

Converted to ET: **10:00 AM, 11:15 AM, 12:30 PM, 1:45 PM, 3:00 PM**

### Admin Portal
- **URL:** `/admin/availability`
- **Scheduled Dates:** 0
- **Tabs:** Single Date, Multi-Select, Date Range, Weekly Pattern, Block Holidays, Manage Dates, Settings

---

## Database Schema Analysis

### Tables Used

1. **`DateAvailability`** (PR #14) — **This is empty for Roger**
   - `id`, `date`, `startTime`, `endTime`, `timezone`, `createdAt`, `updatedAt`
   - **Current count:** 0 records
   
2. **`AvailabilityRule`** (original system) — **This has weekday rules**
   - `id`, `weekday` (0-6), `startTime`, `endTime`, `timezone`, `createdAt`, `updatedAt`
   - **Inferred from public API:** Weekdays 1-5 (Mon-Fri), 10:00-16:00 ET
   
3. **`BlockedDate`** (PR #15) — Blocks specific dates
   - `id`, `date`, `reason`, `createdAt`, `updatedAt`
   
4. **`BookingSettings`** — Slot configuration
   - `slotLengthMin`: 45 (inferred from API)
   - `bufferMin`: 30 (inferred from API)
   - `minLeadTimeHrs`: 24 (default)

5. **`Booking`** — Confirmed bookings (blocks slots)
6. **`CheckoutHold`** — Temporary holds during checkout (blocks slots for 15 min)

---

## Availability Calculation Flow

**File:** `src/lib/availability.ts` → `getAvailableSlots()`

```
FOR each day in range:
  IF date is blocked (BlockedDate table) → skip
  
  IF DateAvailability records exist for this date:
    ✓ Use them (preferred)
  ELSE IF AvailabilityRule records exist:
    ✓ Fall back to weekly rules (← THE PROBLEM)
  ELSE:
    ✗ No slots
    
  FILTER OUT:
    - Slots before minLeadTime (24 hrs)
    - Slots overlapping confirmed Bookings
    - Slots overlapping unexpired CheckoutHolds
```

**The fallback is automatic and silent.** Roger can't see or manage the weekly rules from the new admin UI.

---

## Admin Tab Inventory

| Tab | What It Stores | Model | Current Usage |
|-----|----------------|-------|---------------|
| **Single Date** | Add one date with hours | `DateAvailability` | 0 records |
| **Multi-Select** | Add multiple dates, same hours | `DateAvailability` (bulk) | 0 records |
| **Date Range** | Fill a date range with hours | `DateAvailability` (bulk) | 0 records |
| **Weekly Pattern** | Apply hours to weekdays over N weeks | `DateAvailability` (computed) | 0 records |
| **Block Holidays** | Block US federal/common holidays | `BlockedDate` (bulk) | Unknown |
| **Manage Dates** | View/delete DateAvailability records | `DateAvailability` (read/delete) | Shows 0 |
| **Settings** | Slot length, buffer, min lead time | `BookingSettings` | 45/30/24 |

**Missing from admin UI:**
- View/edit/delete `AvailabilityRule` records (weekday rules)
- Preview "What customers see" computed from the same logic

---

## Design Requirements

### Unified Admin Screen

**Goals:**
1. **One source of truth:** Only `DateAvailability` (date-specific hours)
2. **No hidden fallbacks:** Remove or disable `AvailabilityRule` fallback
3. **Visual calendar:** Month view, click/drag to open/block dates
4. **Exceptions list:** All blocks, overrides, holidays in one place
5. **Preview:** Show next ~10 bookable slots customers see
6. **Default:** NO availability unless explicitly added

**Recommended Layout:**

```
┌─────────────────────────────────────────────────────────┐
│ Availability Management                    [Settings ⚙] │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  CALENDAR (Oct 2026)              QUICK ACTIONS          │
│  ┌───┬───┬───┬───┬───┬───┬───┐  ┌──────────────────┐   │
│  │ S │ M │ T │ W │ T │ F │ S │  │ Add Single Date  │   │
│  ├───┼───┼───┼───┼───┼───┼───┤  ├──────────────────┤   │
│  │   │   │ 1 │ 2 │ 3 │ 4 │ 5 │  │ Add Date Range   │   │
│  │ 6 │ 7 │ 8 │ 9 │10 │11 │12 │  ├──────────────────┤   │
│  │   │   │   │   │ ● │ ● │   │  │ Weekly Pattern   │   │
│  │   (● = available  ✗ = blocked) ├──────────────────┤   │
│                                    │ Block Holidays   │   │
│                                    └──────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  WHAT CUSTOMERS SEE (next 10 slots)                     │
│  • Mon, Oct 12 at 10:00 AM ET                            │
│  • Mon, Oct 12 at 11:15 AM ET                            │
│  • Mon, Oct 12 at 12:30 PM ET                            │
│  ...                                                     │
├─────────────────────────────────────────────────────────┤
│  EXCEPTIONS & BLOCKS (15)                                │
│  • Oct 12, 2026: 10:00 AM - 4:00 PM ET      [Edit] [×]  │
│  • Dec 25, 2026: Blocked (Christmas)        [Edit] [×]  │
│  ...                                                     │
└─────────────────────────────────────────────────────────┘
```

---

## Migration Plan (IF NEEDED)

**Current state:**
- `AvailabilityRule` records exist (weekday rules)
- `DateAvailability` is empty

**Options:**

### Option A: Delete Weekly Rules (Recommended)
```sql
-- Read-only check first
SELECT * FROM "AvailabilityRule";

-- IF Roger confirms they should be deleted:
DELETE FROM "AvailabilityRule";
```

**Result:** Public availability = 0 slots until Roger adds dates manually

### Option B: Migrate Rules to Date-Specific Hours
Convert weekly rules → explicit dates for next 90 days
```sql
-- Example: Mon-Fri 10:00-16:00 ET → 90 individual DateAvailability records
-- (Would need a migration script)
```

**Result:** Public availability matches current, but now manageable in admin

### Option C: Keep Rules, Make Fallback Opt-In
Add `BookingSettings.enableWeeklyRuleFallback: boolean` (default `false`)

**Result:** Roger can toggle whether to use weekly rules as default

**⚠️ IMPORTANT:** Do NOT run any migration against production without approval.  
If Vercel preview points at production DB, do NOT run migrations there either.

---

## Technical Changes Required

### 1. Remove Hard-Coded Fallback
**File:** `src/lib/availability.ts`  
**Lines:** 426-447 (the `else if (rules.length > 0)` block)

**Change:** Remove or wrap in a setting check:
```typescript
} else if (settings.enableWeeklyRuleFallback && rules.length > 0) {
  // Fallback to weekly rules (opt-in)
```

### 2. Add Shared Availability Function
**New:** `getCustomerVisibleSlots()` used by:
- Public API `/api/booking/slots`
- Admin preview component

**Ensures:** Admin and public use identical logic

### 3. Add Dynamic Directive to Public API
**File:** `src/app/api/booking/slots/route.ts`  
**Add:** `export const dynamic = 'force-dynamic';`  
**Reason:** Prevent Next.js from caching stale availability

### 4. Unified Admin Component
**File:** `src/components/UnifiedAvailabilityManager.tsx`  
**Features:**
- Month calendar (date picker grid)
- Click date → modal to set hours or block
- "What customers see" preview (live)
- Exceptions list (all DateAvailability + BlockedDate)
- Settings panel (slot length, buffer, min lead time)

### 5. Tests (if test setup exists)
```typescript
// Test: empty config => zero slots
// Test: blocked date => no slots on that date
// Test: opened date => slots appear in ET
// Test: min lead time respected
```

---

## Decisions for Roger

1. **What to do with existing weekly rules?**
   - [ ] Delete them (start fresh, no slots until I add dates)
   - [ ] Migrate them to date-specific hours for next 90 days
   - [ ] Keep them as opt-in fallback

2. **Booking window: How far ahead can customers book?**
   - Current: Unlimited (if availability exists)
   - Options: 30 days, 60 days, 90 days, or leave unlimited

3. **Slot configuration (current: 45 min slots, 30 min buffer, 24 hrs notice):**
   - [ ] Keep current settings
   - [ ] Change to: ____ min slots, ____ min buffer, ____ hrs notice

4. **Default weekly hours (if keeping fallback)?**
   - Current inferred: Mon-Fri 10:00 AM - 4:00 PM ET
   - [ ] Confirm correct
   - [ ] Change to: ___________________

---

## Next Steps

1. ✅ Diagnose root cause (DONE)
2. ⏳ Implement unified admin UI
3. ⏳ Remove/neutralize weekly rule fallback
4. ⏳ Add "What customers see" preview
5. ⏳ Add tests (if test setup exists)
6. ⏳ Create DRAFT PR with screenshots
7. ⏳ Document migration plan for Roger to review
8. ⏳ Deploy Vercel preview for testing

---

**Author:** Cursor Cloud Agent  
**Status:** HOLD-MERGE (review and approval required before merge)
