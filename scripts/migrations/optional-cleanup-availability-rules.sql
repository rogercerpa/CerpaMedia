-- Migration: Clean up AvailabilityRule records (optional)
--
-- ⚠️ IMPORTANT: NOT RUN AUTOMATICALLY. Do NOT run against production without approval.
--
-- This script removes all weekly recurring availability rules (AvailabilityRule table).
-- After running this, only DateAvailability records will create customer-visible slots.
--
-- To preview what will be deleted, first run:
-- SELECT * FROM "AvailabilityRule";
--
-- To execute the deletion (IRREVERSIBLE):
-- BEGIN;
--   DELETE FROM "AvailabilityRule";
--   SELECT COUNT(*) FROM "AvailabilityRule"; -- Should return 0
-- COMMIT;

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
