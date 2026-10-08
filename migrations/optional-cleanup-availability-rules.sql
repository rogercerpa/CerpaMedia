-- Migration: Clean up AvailabilityRule records (optional)
--
-- ⚠️ IMPORTANT: Do NOT run this against production without approval from Roger.
--
-- This script removes all weekly recurring availability rules (AvailabilityRule table).
-- After running this, only DateAvailability records will create customer-visible slots.
--
-- Run this ONLY if Roger confirms:
-- 1. He wants to delete existing weekly rules
-- 2. He understands customers will see zero slots until he adds dates manually
--
-- To preview what will be deleted, first run:
-- SELECT * FROM "AvailabilityRule";
--
-- To execute the deletion (IRREVERSIBLE):
-- BEGIN;
--   DELETE FROM "AvailabilityRule";
--   -- Verify the count
--   SELECT COUNT(*) FROM "AvailabilityRule"; -- Should return 0
-- COMMIT;
--
-- Alternative: If Roger wants to keep them as historical data but not use them,
-- you can leave the table as-is. The application will ignore it after this PR merges.

-- Read-only preview query
SELECT 
  id,
  weekday,
  CASE weekday
    WHEN 0 THEN 'Sunday'
    WHEN 1 THEN 'Monday'
    WHEN 2 THEN 'Tuesday'
    WHEN 3 THEN 'Wednesday'
    WHEN 4 THEN 'Thursday'
    WHEN 5 THEN 'Friday'
    WHEN 6 THEN 'Saturday'
  END as day_name,
  startTime,
  endTime,
  timezone,
  createdAt
FROM "AvailabilityRule"
ORDER BY weekday, startTime;

-- Expected output (based on public API behavior):
-- 5 records for Monday-Friday, 10:00-16:00 ET
