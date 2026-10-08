# Current Admin Availability Tab Inventory

## Existing Tabs (DateAvailabilityManager.tsx)

| Tab | Purpose | What It Does | Model | State |
|-----|---------|--------------|-------|-------|
| **Single Date** | Add one date | Opens a form to add one specific date with start/end times | DateAvailability | Form state: date, startTime, endTime |
| **Multi-Select** | Add multiple dates | Select multiple dates from a picker, apply same hours to all | DateAvailability (bulk create) | multiDates array, multiHours |
| **Date Range** | Fill date range | Fill a start-to-end range with same hours, optional weekdays-only filter | DateAvailability (bulk create) | rangeForm: startDate, endDate, startTime, endTime, weekdaysOnly |
| **Weekly Pattern** | Apply to weekdays | Select weekdays (Sun-Sat checkboxes) and apply hours to those days over N weeks | DateAvailability (computed bulk create) | patternForm: weekdays[], startTime, endTime, numberOfWeeks, startDate |
| **Block Holidays** | Block US holidays | Preview federal/common US holidays for a year, select which to block | BlockedDate (bulk create) | holidayForm: year, federalOnly; holidayPreview[], selectedHolidays[] |
| **Manage Dates** | View/edit/delete | List all DateAvailability records with checkboxes for bulk delete, individual delete buttons | DateAvailability (read/delete) | selectedAvails[], dateAvails[] |
| **Settings** | Slot configuration | Edit slot length (min), buffer between slots (min), minimum lead time (hours) | BookingSettings (update) | settingsForm: slotLengthMin, bufferMin, minLeadTimeHrs |

## Data Models Used

1. **DateAvailability** - Main model for date-specific hours
   - Fields: id, date, startTime, endTime, timezone, createdAt, updatedAt
   - Current count: 0 (Roger has no records)

2. **BlockedDate** - Blocks specific dates
   - Fields: id, date, reason, createdAt, updatedAt
   - Used by: Block Holidays tab

3. **BookingSettings** - Global slot configuration
   - Fields: id, slotLengthMin, bufferMin, minLeadTimeHrs, createdAt, updatedAt
   - Used by: Settings tab

4. **AvailabilityRule** - Legacy weekly rules (NO LONGER USED by app after this PR)
   - Fields: id, weekday (0-6), startTime, endTime, timezone, createdAt, updatedAt
   - Not shown in admin UI
   - Will remain in database but unused

## Tab Semantics Summary

**Opening availability (creates DateAvailability):**
- Single Date, Multi-Select, Date Range, Weekly Pattern

**Blocking availability (creates BlockedDate):**
- Block Holidays

**Managing records:**
- Manage Dates (view/delete DateAvailability)
- Settings (update BookingSettings singleton)

**No UI for:**
- AvailabilityRule (legacy, deprecated after this PR)
- Viewing/managing BlockedDate records (holidays tab only creates them)
