# Admin Date Availability Migration Guide

## Current Production Status (Oct 1, 2026)

**Health Check**: `https://cerpamedia.com/api/booking/health`

```json
{
  "ok": true,
  "tables": {
    "availabilityRule": true,
    "blockedDate": true,
    "booking": true,
    "bookingSettings": true
  },
  "dbHost": "ep-muddy-forest-b57tyb64.c-7.us-east-2.aws.neon.tech",
  "timestamp": "2026-10-01T17:54:12.087Z"
}
```

**Issue**: DateAvailability table does not exist yet on production Neon database.

## PR #15 Changes

This PR fixes the admin date save failure and adds bulk scheduling tools.

### What's Fixed
1. **Clear error messages** when DateAvailability table is missing
2. **Health endpoint updated** to report dateAvailability table status
3. **Prisma error detection** (P2021 = table missing, P2002 = duplicate, P2025 = not found)

### What's New
- Multi-date selection
- Date range fill (with weekdays-only option)
- Weekly pattern application (e.g., Mon–Fri for 4 weeks)
- US holiday blocking (federal + common holidays)
- Bulk delete operations
- Enhanced admin UI with 7 tabs

## Migration Steps

### Step 1: Merge PR #15
Once approved and tested on preview, merge to main.

### Step 2: Wait for Production Deployment
Vercel will automatically deploy to https://cerpamedia.com

### Step 3: Run Database Migration

**IMPORTANT**: You must run this command to create the DateAvailability table:

```bash
npx prisma db push
```

This command will:
- Create the DateAvailability table
- Keep all existing data intact (no data loss)
- No downtime required

**Database Target**: ep-muddy-forest-b57tyb64.c-7.us-east-2.aws.neon.tech

### Step 4: Verify Health Endpoint

After running `npx prisma db push`, check the health endpoint:

```bash
curl https://cerpamedia.com/api/booking/health | jq
```

**Expected result**:
```json
{
  "ok": true,
  "tables": {
    "availabilityRule": true,
    "blockedDate": true,
    "dateAvailability": true,    // ← NEW
    "booking": true,
    "bookingSettings": true
  },
  "dbHost": "ep-muddy-forest-b57tyb64.c-7.us-east-2.aws.neon.tech",
  "timestamp": "..."
}
```

### Step 5: Test Admin Interface

1. Go to https://cerpamedia.com/admin/availability
2. You should see 7 tabs instead of error message
3. Try adding a single date
4. Try multi-date selection
5. Try date range fill
6. Try weekly pattern
7. Try blocking holidays

### Step 6: Test Customer Booking

1. Go to https://cerpamedia.com/consult
2. Calendar should load correctly
3. Available dates should appear
4. Slot booking should work end-to-end

## What if Migration Fails?

### If `npx prisma db push` fails:

1. Check your `DATABASE_URL` environment variable points to the correct Neon database
2. Check Prisma version: `npx prisma --version`
3. Ensure schema file is up to date with main branch
4. Try: `npx prisma generate` first, then `npx prisma db push`

### If admin page shows error after migration:

The error will be specific and actionable. Common cases:

**Error**: "DateAvailability table does not exist"
- **Fix**: Run `npx prisma db push` (you missed step 3)

**Error**: Generic network error
- **Check**: Database is accessible
- **Check**: `DATABASE_URL` is correct in production env vars

### Rollback Plan

If issues occur after deployment but before `npx prisma db push`:
- Do nothing - the old AvailabilityRule weekday system still works
- Admin can still manage weekly schedules via the old interface
- Customer booking flow is unaffected

If issues occur after `npx prisma db push`:
- The DateAvailability table will remain but won't be used if you roll back code
- Old AvailabilityRule system will take over as fallback
- No data loss - you can re-merge when ready

## Timeline

1. **Merge PR #15**: Code deployed, but DateAvailability table doesn't exist yet
2. **Admin visits /admin/availability**: Sees clear error message with instructions
3. **Run `npx prisma db push`**: Creates table in ~5 seconds
4. **Refresh admin page**: Full bulk scheduling UI appears
5. **Start using**: Multi-date, range fill, pattern, holidays all work

## Support

If you encounter issues:
1. Check health endpoint first: `https://cerpamedia.com/api/booking/health`
2. Check browser console for errors
3. Check Vercel deployment logs
4. Check Neon database logs

## Notes

- **No downtime required** - migration is additive only
- **No data loss** - existing AvailabilityRule and BlockedDate data preserved
- **Coexistence** - both date-based and weekday-based systems work together
- **Customer flow unaffected** - booking continues to work throughout migration
