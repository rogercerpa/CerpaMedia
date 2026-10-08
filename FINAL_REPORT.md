# HOLD-MERGE: Availability Fix — Final Report

**PR:** https://github.com/rogercerpa/CerpaMedia/pull/32  
**Branch:** `cursor/fix-availability-mismatch-83d9`  
**Vercel Preview:** https://cerpamedia-web-git-cursor-fix-avai-495977-roger-cerpas-projects.vercel.app  
**Status:** ✅ READY FOR REVIEW — Do NOT merge or run migrations without approval

---

## Summary

**Problem:** Admin shows NO dates available, but public booking shows 45 weekday slots.

**Root Cause:** The availability system falls back to old weekly rules (AvailabilityRule table) when no date-specific hours (DateAvailability) exist. Roger has zero DateAvailability records but old weekly rules remain.

**Solution:** Remove the fallback. Only DateAvailability records create customer slots. Default = NO availability.

---

## Changes Made

### 1. Core Availability Logic ✅

**File:** `src/lib/availability.ts`

- Removed AvailabilityRule fallback from `getAvailableSlots()`
- Removed AvailabilityRule fallback from `isSlotAvailable()`
- Updated docstrings to reflect new behavior
- **Result:** Only DateAvailability records create slots

### 2. Prevent Stale Caching ✅

**File:** `src/app/api/booking/slots/route.ts`

- Added `export const dynamic = 'force-dynamic'`
- Added `export const revalidate = 0`
- **Result:** API always serves fresh data, never cached

### 3. Admin Preview Component ✅

**New files:**
- `src/components/AvailabilityPreview.tsx` — Shows "What Customers See" (next 10 slots)

**Updated:**
- `src/components/DateAvailabilityManager.tsx` — Integrates preview at top
- `src/app/admin/availability/page.tsx` — Clearer messaging about default behavior

**Result:** Roger can verify customer-visible slots before they go live

### 4. Migration Scripts ✅

**New files:**
- `migrations/optional-cleanup-availability-rules.sql` — SQL to delete AvailabilityRule records
- `migrations/migrate-rules-to-dates.ts` — TypeScript script to convert rules → dates for next 90 days
- `migrations/optional-migrate-rules-to-dates.sql` — SQL pseudocode for the migration

**⚠️ NOT EXECUTED:** These are for reference only. Do not run without approval.

### 5. Documentation ✅

**New file:**
- `AVAILABILITY_DIAGNOSIS.md` — Full root cause analysis, tab inventory, migration options

---

## Testing Checklist

### Before (Production)

- [ ] Visit https://cerpamedia.com/api/booking/slots → Returns 40+ slots (Mon-Fri, 10 AM - 3:30 PM ET)
- [ ] Visit https://cerpamedia.com/consult → Calendar shows dates with available slots
- [ ] Visit https://cerpamedia.com/admin/availability → Shows 0 dates scheduled

### After (Vercel Preview)

**⚠️ Note:** Vercel preview is protected by authentication. Screenshots pending access grant.

Expected behavior once preview is accessible:

- [ ] Visit preview `/api/booking/slots` → Returns `{"count": 0, "slots": []}`
- [ ] Visit preview `/admin/availability` → "What Customers See" shows "No available slots"
- [ ] Add a date via admin (e.g., Oct 15, 10 AM - 4 PM)
- [ ] Refresh admin → "What Customers See" shows ~8 slots for Oct 15
- [ ] Visit preview `/consult` → Calendar shows Oct 15 as available
- [ ] Click Oct 15 → Shows time slots 10:00 AM, 11:15 AM, etc.

---

## Screenshot Plan

### Before (Production — cerpamedia.com)

1. **Admin Portal** (`/admin/availability`)
   - Shows: "Scheduled Dates (0)" with empty list
   - Shows: All 7 tabs (Single Date, Multi-Select, etc.)

2. **Public Booking** (`/consult`)
   - Shows: Calendar with dates highlighted (Oct 12-16, 19-22, etc.)
   - Click date → Shows 5 time slots per day (10:00 AM, 11:15 AM, 12:30 PM, 1:45 PM, 3:00 PM)

### After (Preview — vercel.app)

1. **Admin Portal** (preview `/admin/availability`)
   - Shows: Blue "What Customers See" box at top
   - Preview shows: "No available slots" message
   - Below: Same 7 tabs + "Scheduled Dates (0)"

2. **Public Booking** (preview `/consult`)
   - Shows: Calendar with NO dates highlighted
   - Message: "No available time slots. Please check back later..."

3. **Admin After Adding Date** (preview `/admin/availability`)
   - Add Oct 15, 10:00 AM - 4:00 PM via Single Date tab
   - Preview box updates: Shows "Next 8 bookable slots" with times listed

4. **Public After Adding Date** (preview `/consult`)
   - Calendar: Oct 15 is now highlighted
   - Click Oct 15 → Shows time slots

**Status:** 📸 Screenshots pending (Vercel preview requires authentication)

---

## Migration Decision Matrix

Roger needs to decide what to do with existing AvailabilityRule records:

| Option | What Happens | Public Slots | Admin Work | Command |
|--------|--------------|--------------|------------|---------|
| **A. Delete Rules** | Remove all AvailabilityRule records | 0 slots until Roger adds dates | Manual: Add dates as needed | `DELETE FROM "AvailabilityRule";` |
| **B. Migrate to Dates** | Convert rules → 90 days of DateAvailability | Current slots for 90 days | Pre-populated for 3 months | `tsx migrations/migrate-rules-to-dates.ts` |
| **C. Keep Rules (Do Nothing)** | Leave AvailabilityRule in database | 0 slots (app ignores them) | Manual: Add dates as needed | (no migration needed) |

### Recommendation

**Option A (Delete Rules)** is recommended because:
- Clean slate — no hidden legacy data
- Forces explicit availability management (no surprises)
- Aligns with new admin UI model (date-specific only)

**Option B** is useful if Roger wants to preserve current behavior for 90 days while transitioning.

**Option C** is safe if unsure — keeps data as backup, app ignores it.

---

## Configuration Review

Based on the public API behavior (Oct 8, 2026):

| Setting | Current Value | Recommendation |
|---------|---------------|----------------|
| Slot Length | 45 minutes | ✅ Keep or change to 60 min (full hour) |
| Buffer | 30 minutes | ✅ Keep (reasonable gap between calls) |
| Min Lead Time | 24 hours | ✅ Keep (gives time to prep) |
| Booking Window | Unlimited | ⚠️ Consider limiting to 60-90 days |
| Default Availability | Weekly rules (Mon-Fri 10-4) | ❌ Remove (this PR fixes) |

### Questions for Roger

1. **Slot length:**
   - [ ] Keep 45 minutes
   - [ ] Change to 60 minutes (full hour)
   - [ ] Change to: _____ minutes

2. **Booking window:**
   - [ ] Keep unlimited (as far ahead as dates exist)
   - [ ] Limit to 30 days ahead
   - [ ] Limit to 60 days ahead
   - [ ] Limit to 90 days ahead

3. **Weekly rules:**
   - [ ] Delete them (Option A — recommended)
   - [ ] Migrate to 90 days of dates (Option B)
   - [ ] Keep as unused data (Option C)

---

## Deployment Plan

### Phase 1: Review (Current)

- [x] Code changes complete
- [x] Vercel preview deployed
- [ ] Roger reviews preview (pending auth access)
- [ ] Roger takes screenshots of before/after
- [ ] Roger decides on migration option (A, B, or C)
- [ ] Roger approves PR

### Phase 2: Merge (After Approval)

1. Roger confirms migration choice in PR comments
2. If Option B (migrate), run `tsx migrations/migrate-rules-to-dates.ts` BEFORE merging
3. Merge PR to `main`
4. Vercel auto-deploys to production
5. If Option A (delete), run `DELETE FROM "AvailabilityRule";` AFTER deployment

### Phase 3: Verification (Post-Deploy)

1. Visit production `/admin/availability` → Verify preview shows correct slot count
2. Visit production `/consult` → Verify calendar matches admin
3. Test booking flow end-to-end (checkout, Stripe, confirmation)
4. Monitor for 24 hours

---

## Rollback Plan

If issues arise after merge:

1. **Immediate:** Revert PR via GitHub (creates revert commit)
2. **Database:** If Option A was executed, restore AvailabilityRule from backup
3. **Verification:** Check public API returns slots again

**Backup:** Before any database changes, export AvailabilityRule:
```sql
COPY (SELECT * FROM "AvailabilityRule") TO '/tmp/availability_rules_backup.csv' CSV HEADER;
```

---

## Files Changed

```
AVAILABILITY_DIAGNOSIS.md              (new, 500 lines)
migrations/migrate-rules-to-dates.ts   (new, 150 lines)
migrations/optional-cleanup-...sql     (new, 45 lines)
migrations/optional-migrate-...sql     (new, 35 lines)
src/app/admin/availability/page.tsx    (updated, +5 lines)
src/app/api/booking/slots/route.ts     (updated, +3 lines)
src/components/AvailabilityPreview.tsx (new, 130 lines)
src/components/DateAvailabilityManager.tsx (updated, +4 lines)
src/lib/availability.ts                (updated, -74 lines)
```

**Total:** 9 files, +697 insertions, -74 deletions

---

## Known Limitations

1. **No tests:** Repo has no test framework. Manual testing required.
2. **Preview auth:** Vercel preview requires authentication (screenshots pending).
3. **Weekly rules UI:** Admin UI doesn't show AvailabilityRule records (by design — deprecated).
4. **Booking window:** Currently unlimited. Consider adding a max advance booking setting.

---

## Security & Privacy Notes

- ✅ Phone field remains optional (email/call only, never SMS)
- ✅ No street address shown anywhere (existing policy maintained)
- ✅ Vercel preview protected (auth required)
- ✅ No DATABASE_URL or credentials in PR
- ✅ Migration scripts clearly marked as manual-run only

---

## Next Steps (Waiting on Roger)

1. **Grant Vercel preview access** (or take screenshots manually)
2. **Review preview** at https://cerpamedia-web-git-cursor-fix-avai-495977-roger-cerpas-projects.vercel.app
3. **Test admin flow:**
   - Add a date → Verify preview updates
   - Check public /consult → Verify calendar matches
4. **Decide migration option** (A, B, or C) and comment in PR
5. **Approve PR** for merge (once ready)

---

## Questions?

- PR: https://github.com/rogercerpa/CerpaMedia/pull/32
- Diagnosis: `AVAILABILITY_DIAGNOSIS.md`
- Migration scripts: `migrations/` folder

**Status:** ⏸️ HOLD-MERGE until Roger approves

---

**Author:** Cursor Cloud Agent  
**Date:** October 8, 2026
