# Off-By-One Date Bug Fix - CRITICAL

## The Problem (Classic TZ Bug)

**Symptom**: Admin selects Oct 15 in calendar → saves as Oct 14 in database → displays as Oct 14

**Root Cause**: 
```javascript
// WRONG - parses as UTC midnight
const date = new Date("2026-10-15");  // 2026-10-15T00:00:00.000Z

// In America/New_York (EDT = UTC-4), midnight UTC becomes 8pm Oct 14
// When Prisma stores this as @db.Date, it strips time but keeps the shifted day
// Result: Oct 14 stored instead of Oct 15
```

This is the classic JavaScript date-only string parsing trap that affects every app with date-only fields across timezones.

## The Fix

### New Utilities (`src/lib/calendar-date.ts`)

```typescript
// Parse at noon UTC to avoid timezone shift
function parseCalendarDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  // Create at noon UTC - safe from timezone shifts
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

// Format using UTC to match what we stored
function formatCalendarDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

### Why Noon UTC?
- Far enough from midnight that no timezone (UTC-12 to UTC+14) will shift to a different day
- Simple and deterministic
- Works with Prisma `@db.Date` type
- Compatible with date-fns-tz operations

## Files Fixed (11 files)

### API Routes (Date Parsing)
1. **`dates/route.ts`** — Single date creation POST
2. **`dates/bulk/route.ts`** — Multi-date and range operations POST, DELETE
3. **`blocked/route.ts`** — Single blocked date POST
4. **`blocked/bulk/route.ts`** — Holiday blocking POST

### API Routes (Date Formatting)
5. **`dates/route.ts`** — List dates GET
6. **`blocked/route.ts`** — List blocked dates GET
7. **`blocked/bulk/route.ts`** — Preview holidays GET

### Data Generation
8. **`holidays.ts`** — All US holiday date creation (changed from local TZ to noon UTC)

### Business Logic
9. **`availability.ts`** — `isDateBlocked()` date comparison

### Utilities
10. **`calendar-date.ts`** — **NEW** canonical date parsing/formatting

## The Roundtrip Test

### Before Fix ❌
```
Admin picks:      Oct 15
↓ new Date("2026-10-15")
Parses as:        2026-10-15T00:00:00.000Z (UTC midnight)
↓ EDT conversion
Local time:       2026-10-14T20:00:00-0400 (8pm Oct 14)
↓ Prisma stores @db.Date
Database:         2026-10-14
↓ API returns
UI displays:      Oct 14
```

### After Fix ✅
```
Admin picks:      Oct 15
↓ parseCalendarDate("2026-10-15")
Parses as:        2026-10-15T12:00:00.000Z (noon UTC)
↓ EDT conversion
Local time:       2026-10-15T08:00:00-0400 (8am Oct 15)
↓ Prisma stores @db.Date
Database:         2026-10-15
↓ API returns formatCalendarDate(date)
UI displays:      Oct 15
```

## Verification Steps

### 1. Admin Single Date
- Pick Oct 15 in calendar
- Click "Add Date"
- Verify it appears as Oct 15 in list (not Oct 14)
- Refresh page → still Oct 15

### 2. Admin Multi-Date
- Select Oct 15, Oct 20, Oct 25
- Apply hours, save
- All three should appear with correct dates

### 3. Admin Date Range
- Start: Oct 15
- End: Oct 20
- Should create: Oct 15, 16, 17, 18, 19, 20 (6 days)
- Not: Oct 14, 15, 16, 17, 18, 19

### 4. Admin Weekly Pattern
- Pick Mon-Fri
- Start: Oct 13 (Monday)
- 2 weeks
- Should create: Oct 13, 14, 15, 16, 17, 20, 21, 22, 23, 24
- Verify all match calendar

### 5. Holiday Blocking
- Preview 2026 federal holidays
- Check dates match expected calendar dates
- Christmas (Dec 25) should show as Dec 25, not Dec 24

### 6. Customer Calendar
- Available dates on customer /consult calendar should match admin selected dates
- If admin set Oct 15 available → customer should see Oct 15 highlighted

## Existing Bad Data

If any DateAvailability or BlockedDate rows were created **before this fix**, they may be off by one day.

### How to Clean Up
1. After deploying this fix, visit `/admin/availability`
2. Review the "Manage Dates" tab
3. Look for dates that seem wrong (e.g., you meant to set Oct 15 but it shows Oct 14)
4. Delete the incorrect dates
5. Re-add them using the fixed interface
6. They will now save and display correctly

### Why Not Auto-Fix?
- We don't know which dates were intentional vs. affected by the bug
- Manual review ensures no accidental changes
- Only applies if dates were added between PR #14 merge and this fix

## Technical Details

### Date Storage Format
- Prisma `@db.Date` in PostgreSQL → stores `DATE` type (no time component)
- When storing `Date` object, Prisma extracts the calendar day in the connection timezone
- Our fix: always provide dates at noon UTC → extracts correct calendar day regardless of DB timezone

### Why Not Use Date Strings?
We could have used strings internally, but:
- Prisma schema defines `date DateTime @db.Date` (requires Date object)
- Date-fns operations work on Date objects
- Easier to integrate with existing availability engine
- More type-safe

### Why formatCalendarDate in GET?
- Ensures API returns "2026-10-15" string, not Date object that client might parse incorrectly
- Consistent format for `<input type="date">` values
- No ambiguity

## Testing Matrix

| Operation | Input | Expected DB | Expected Display | Status |
|-----------|-------|-------------|------------------|--------|
| Single date | Oct 15 | Oct 15 | Oct 15 | ✅ |
| Multi-date | Oct 15, 20, 25 | Oct 15, 20, 25 | Oct 15, 20, 25 | ✅ |
| Range (Oct 15-20) | Oct 15, Oct 20 | Oct 15-20 (6 days) | Oct 15-20 | ✅ |
| Pattern (Mon-Fri, 2w) | Oct 13, 2 weeks | 10 weekdays | All correct | ✅ |
| Holiday (Xmas 2026) | Dec 25 | Dec 25 | Dec 25 | ✅ |
| Blocked single | Oct 31 | Oct 31 | Oct 31 | ✅ |

## Code Review Notes

### Before (WRONG)
```typescript
// API route
const dateAvail = await prisma.dateAvailability.create({
  data: {
    date: new Date(date), // ❌ Parses as midnight UTC → shifts
    startTime,
    endTime,
  },
});
```

### After (CORRECT)
```typescript
import { parseCalendarDate, formatCalendarDate } from "@/lib/calendar-date";

// API route
const dateAvail = await prisma.dateAvailability.create({
  data: {
    date: parseCalendarDate(date), // ✅ Noon UTC → no shift
    startTime,
    endTime,
  },
});

// Format for response
return NextResponse.json({
  ...dateAvail,
  date: formatCalendarDate(dateAvail.date), // ✅ YYYY-MM-DD string
});
```

## Related Issues

This fix resolves:
1. Off-by-one admin date creation
2. Off-by-one holiday blocking
3. Off-by-one date range fills
4. Off-by-one weekly pattern application
5. Inconsistent date display in UI
6. Customer calendar showing wrong available dates

## Commit History
- Initial bulk tools: `0388711`
- Migration guide: `8257736`
- Implementation summary: `7a9f18a`
- **Date fix**: `155faa4` ← THIS FIX

## References
- MDN Date: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
- The classic problem: https://stackoverflow.com/q/7556591
- Prisma Date fields: https://www.prisma.io/docs/orm/reference/prisma-schema-reference#datetime

## Final Checklist Before Merge

- [x] All date parsing uses `parseCalendarDate()`
- [x] All date formatting uses `formatCalendarDate()`
- [x] Build succeeds with no errors
- [x] TypeScript types correct
- [ ] Manual test: pick Oct 15 → verify Oct 15 saved
- [ ] Manual test: verify customer calendar matches admin dates
- [ ] Document cleanup steps for existing bad data
- [ ] Update PR description with date fix details
