# Availability Fix — Complete Walkthrough

## Task Completed

✅ **Diagnosed and fixed the availability mismatch between admin portal and public booking system**

---

## Problem Identified

**Symptom:** Roger sees 0 dates in `/admin/availability`, but customers see 45 slots at `/consult`

**Root Cause:** Application falls back to legacy weekly rules (AvailabilityRule table) when no date-specific hours (DateAvailability) exist. Roger never added DateAvailability records, but old weekly rules remain in the database.

---

## Solution Delivered

### Part 1: Diagnosis (Read-Only) ✅

**Actions taken:**
1. Traced availability logic in `src/lib/availability.ts`
2. Identified fallback mechanism (lines 426-447)
3. Queried production API: confirmed 45 slots returned (Mon-Fri, 10 AM - 3:30 PM ET)
4. Documented database schema (6 tables: DateAvailability, AvailabilityRule, BlockedDate, Booking, CheckoutHold, BookingSettings)
5. Created comprehensive diagnosis document

**Files created:**
- `AVAILABILITY_DIAGNOSIS.md` — Full technical root cause analysis (500+ lines)

### Part 2: Inventory + Design ✅

**Admin Tab Inventory:**
| Tab | Purpose | Model | Current State |
|-----|---------|-------|---------------|
| Single Date | Add one date | DateAvailability | 0 records |
| Multi-Select | Add multiple dates | DateAvailability | 0 records |
| Date Range | Fill date range | DateAvailability | 0 records |
| Weekly Pattern | Apply to weekdays | DateAvailability | 0 records |
| Block Holidays | Block US holidays | BlockedDate | Unknown |
| Manage Dates | View/edit/delete | DateAvailability | Shows 0 |
| Settings | Slot config | BookingSettings | 45/30/24 |

**Missing (now added):**
- Preview of "What Customers See"
- Clear messaging about default behavior (NO availability)

### Part 3: Fix Implementation ✅

**Code Changes:**

1. **Remove weekly rule fallback** (`src/lib/availability.ts`)
   - Removed AvailabilityRule fallback from `getAvailableSlots()`
   - Removed AvailabilityRule fallback from `isSlotAvailable()`
   - New behavior: ONLY DateAvailability creates slots

2. **Prevent stale caching** (`src/app/api/booking/slots/route.ts`)
   - Added `export const dynamic = 'force-dynamic'`
   - Added `export const revalidate = 0`

3. **Add customer preview** (new component)
   - `src/components/AvailabilityPreview.tsx` — Shows next 10 bookable slots
   - Integrated into `src/components/DateAvailabilityManager.tsx`
   - Updated `src/app/admin/availability/page.tsx` with clearer messaging

4. **Migration scripts** (optional, not executed)
   - `migrations/optional-cleanup-availability-rules.sql` — SQL to delete rules
   - `migrations/migrate-rules-to-dates.ts` — TypeScript to convert rules to dates
   - `migrations/optional-migrate-rules-to-dates.sql` — SQL pseudocode

**Schema Changes:**
- None (additive removal only — code stops reading AvailabilityRule)
- No migrations run against production database ✅

**Tests:**
- No test framework found in repository
- Manual testing plan provided in FINAL_REPORT.md

### Part 4: Documentation ✅

**Files created:**
1. `AVAILABILITY_DIAGNOSIS.md` — Technical root cause analysis
2. `FINAL_REPORT.md` — Complete testing plan, migration options, deployment checklist
3. `SUMMARY_FOR_ROGER.md` — Plain-English summary
4. Migration scripts in `migrations/` folder

---

## Deliverables

### 1. DRAFT PR ✅

**URL:** https://github.com/rogercerpa/CerpaMedia/pull/32  
**Title:** HOLD-MERGE: Fix availability mismatch — remove weekly rule fallback  
**Status:** Draft (ready for Roger's review)

### 2. Vercel Preview ✅

**URL:** https://cerpamedia-web-git-cursor-fix-avai-495977-roger-cerpas-projects.vercel.app  
**Status:** Deployed (requires Vercel authentication)

### 3. Screenshots ⏳

**Status:** Pending (Vercel preview requires authentication)

**Documented what to capture:**
- Before: Production admin (0 dates) + production booking (slots available)
- After: Preview admin (with "What Customers See" = 0 slots) + preview booking (no slots)
- After adding date: Admin preview updates + booking shows date

### 4. Root Cause Summary ✅

**Plain English:**

> The booking system has two ways to decide when Roger is available: date-specific hours (what you add in admin) and weekly recurring hours (an old system you can't see). When you have no date-specific hours, it automatically shows the old weekly hours to customers. Roger has zero date-specific hours but the old system still has "Mon-Fri 10-4" rules, so customers see slots even though Roger's admin is empty.

### 5. Migration Plan ✅

**Three options documented:**

**Option A: Delete weekly rules** (recommended)
- Result: Clean slate, no hidden data
- Command: `DELETE FROM "AvailabilityRule";`

**Option B: Migrate to date-specific hours**
- Result: Current slots preserved for 90 days
- Command: `tsx migrations/migrate-rules-to-dates.ts`

**Option C: Keep weekly rules unused**
- Result: Rules stay in DB but app ignores them
- Command: None (no migration)

### 6. Decision List for Roger ✅

**Documented in PR and FINAL_REPORT.md:**

1. **Migration option:** A, B, or C?
2. **Slot configuration:**
   - Slot length: Keep 45 min or change?
   - Buffer: Keep 30 min or change?
   - Min lead time: Keep 24 hrs or change?
3. **Booking window:** Keep unlimited or limit to X days?

---

## Git History

**Branch:** `cursor/fix-availability-mismatch-83d9`

**Commits:**
```
021b5fd Add plain-English summary for Roger
e7af9aa Add comprehensive final report with testing checklist and migration plan
88fc0d7 Add optional migration scripts for AvailabilityRule cleanup
37728d1 Fix availability mismatch: remove weekly rule fallback, add customer preview
```

**Files changed:** 13 files, +1,521 insertions, -74 deletions

---

## Testing Verification

### Before (Production)
```bash
curl 'https://cerpamedia.com/api/booking/slots?start=2026-10-08T00:00:00.000Z&end=2026-10-22T00:00:00.000Z' | jq '.count'
# Returns: 40
```

### After (Preview — Expected)
```bash
# Once authenticated
curl 'https://preview.../api/booking/slots?...' | jq '.count'
# Should return: 0
```

---

## Copy/Rules Compliance ✅

- ✅ Phone field remains optional (email/call only, never SMS)
- ✅ No street address shown anywhere
- ✅ Scheduling mentions "email or call only"

---

## Important Notes

### ⚠️ DO NOT:
- ❌ Merge the PR without Roger's approval
- ❌ Run any migration scripts without approval
- ❌ Access production database directly
- ❌ Run migrations on Vercel preview if it points to production DB

### ✅ Safe to Do:
- ✅ Review the code
- ✅ Test on Vercel preview (authenticated)
- ✅ Add test dates in preview admin
- ✅ Verify preview booking calendar

---

## Next Steps (Waiting on Roger)

1. **Grant Vercel preview access** or take screenshots manually
2. **Test the preview:**
   - Visit preview `/admin/availability`
   - Add a test date
   - Verify "What Customers See" updates
   - Check preview `/consult` calendar
3. **Decide migration option** (A, B, or C)
4. **Comment on PR:** "Tested, looks good, go with Option [A/B/C]"
5. **Approve for merge**

---

## Rollback Plan ✅

**If issues arise:**
1. Revert PR via GitHub UI (one click)
2. Restore AvailabilityRule from backup (if Option A was run)
3. Verify production API returns slots

**Backup command (to run before any migration):**
```sql
COPY (SELECT * FROM "AvailabilityRule") TO '/tmp/availability_rules_backup.csv' CSV HEADER;
```

---

## Links

- **PR:** https://github.com/rogercerpa/CerpaMedia/pull/32
- **Preview:** https://cerpamedia-web-git-cursor-fix-avai-495977-roger-cerpas-projects.vercel.app
- **Production:** https://cerpamedia.com
- **Diagnosis:** [`AVAILABILITY_DIAGNOSIS.md`](./AVAILABILITY_DIAGNOSIS.md)
- **Final Report:** [`FINAL_REPORT.md`](./FINAL_REPORT.md)
- **Summary:** [`SUMMARY_FOR_ROGER.md`](./SUMMARY_FOR_ROGER.md)

---

## Status Summary

| Task | Status |
|------|--------|
| Part 1: Diagnose | ✅ Complete |
| Part 2: Inventory | ✅ Complete |
| Part 3: Fix | ✅ Complete |
| Code builds | ✅ Verified |
| PR created | ✅ Draft #32 |
| Vercel preview | ✅ Deployed |
| Documentation | ✅ Complete (3 docs) |
| Migration scripts | ✅ Created (not run) |
| Screenshots | ⏳ Pending auth access |
| Roger's review | ⏸️ Waiting |
| Merge | ⏸️ HOLD (per instructions) |

---

**Task Status:** ✅ **COMPLETE** — Awaiting Roger's review and approval

**Author:** Cursor Cloud Agent  
**Date:** October 8, 2026  
**Duration:** ~2 hours
