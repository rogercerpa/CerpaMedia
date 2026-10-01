# Date-Based Availability Migration Guide

## Overview
This PR adds date-based availability management with proper timezone handling, fixing the timezone bug where slots appeared at incorrect times (2am-7am ET instead of 10am-4pm ET).

## Key Changes

### 1. **Fixed Timezone Bug**
- Replaced fragile manual timezone offset calculations with `date-fns-tz` library
- All times now correctly convert between UTC (database) and America/New_York (display/booking)
- Slots will now appear at the correct times matching your admin settings

### 2. **New Date-Based Availability Model**
Added `DateAvailability` table alongside existing `AvailabilityRule`:
- Set availability by **specific dates** (e.g., "Dec 15, 2024: 10:00-16:00 ET")
- Multiple time windows per date supported
- Date-based availability takes priority over weekday rules when present
- Old weekday rules still work as fallback if no date-specific availability exists

### 3. **New Admin UI**
- `/admin/availability` now shows date-based interface
- Pick specific dates from calendar
- Set start/end hours for each date
- All times in America/New_York timezone
- Old weekday-based AvailabilityManager component preserved in codebase but not used

### 4. **New Customer UI**
- Calendar view shows available dates
- Click a date to see time slots for that day
- Clearer visual flow: Calendar → Day → Slots → Form → Payment
- All displayed times in Eastern Time

## Required Database Migration

**IMPORTANT:** After merging this PR, you MUST run:

```bash
npx prisma db push
```

This will:
- Create the new `DateAvailability` table in Neon
- Keep all existing tables and data intact
- No data loss - your existing `AvailabilityRule` weekday settings remain

## Data Migration Strategy

### Coexistence Model (Recommended)
Both systems work together:
- **Date-based availability** (new): Takes priority when dates are set
- **Weekday rules** (existing): Used as fallback when no date-based availability exists

### Transition Plan
1. Merge PR and run `npx prisma db push`
2. Keep existing weekday rules active (they still work)
3. Start adding date-based availability for upcoming weeks
4. Over time, rely more on date-based, less on weekday rules
5. Optional: Once comfortable, delete old weekday rules from admin UI

### What Happens to Old Weekday Rules?
- They remain in the database
- They still work if you don't set date-based availability
- You can view/edit them via the old admin component if needed
- Safe to delete them once you've fully transitioned to date-based

## Testing Checklist

After deploying and running `db push`:

1. **Admin Panel** (`/admin/availability`):
   - [ ] Add a date in the future
   - [ ] Set time range (e.g., 10:00-16:00)
   - [ ] Verify it appears in "Scheduled Dates"
   - [ ] Delete a date, verify it's removed

2. **Customer Booking** (`/consult`):
   - [ ] See calendar with available dates highlighted
   - [ ] Click an available date
   - [ ] See time slots in **correct ET times** (not 2am-7am)
   - [ ] Complete a test booking
   - [ ] Verify Stripe checkout works
   - [ ] Check booking confirmation email

3. **Timezone Validation**:
   - [ ] Admin sets 10:00-16:00 ET
   - [ ] Customer sees slots like "10:00 AM", "11:00 AM", etc. (not "2:00 AM")
   - [ ] Booked slot appears correctly in admin bookings list

## Rollback Plan

If issues occur:
1. Keep the branch deployed (don't merge to main)
2. Revert by checking out main branch
3. The `DateAvailability` table will remain but won't be used
4. Old weekday system continues working

## Environment Notes

- All timezone handling uses `America/New_York` by default
- `date-fns-tz` added as dependency (already in package.json after merge)
- No environment variables needed
- Compatible with existing Stripe, Resend, Neon setup

## Questions?

Contact the agent that created this PR or check the code comments in:
- `src/lib/availability.ts` - Core availability engine
- `src/components/DateAvailabilityManager.tsx` - Admin UI
- `src/components/CalendarBookingFlow.tsx` - Customer UI
