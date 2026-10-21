-- Additive only.
-- Records whether the buyer welcome and the one setup-session reminder
-- were sent. Safe to run after 20261021150000_launch_purchase_setup_session,
-- including when that file was applied before these columns existed.
--
-- Apply on a Neon backup branch first. Do not point this at production
-- until that backup exists and the branch looks right.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f prisma/migrations/20261021173000_launch_welcome_email/migration.sql

ALTER TABLE "LaunchPurchase" ADD COLUMN IF NOT EXISTS "welcomeSentAt" TIMESTAMP(3);
ALTER TABLE "LaunchPurchase" ADD COLUMN IF NOT EXISTS "welcomeClaimedAt" TIMESTAMP(3);
ALTER TABLE "LaunchPurchase" ADD COLUMN IF NOT EXISTS "welcomeReminderSentAt" TIMESTAMP(3);
ALTER TABLE "LaunchPurchase" ADD COLUMN IF NOT EXISTS "welcomeReminderClaimedAt" TIMESTAMP(3);
