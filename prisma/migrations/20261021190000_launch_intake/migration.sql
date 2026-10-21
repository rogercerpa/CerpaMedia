-- Additive only.
-- Stores AI Teammate Launch intake answers for a purchase.
-- Does not change Booking or BookingSettings. Safe to run after
-- 20261021150000_launch_purchase_setup_session and
-- 20261021173000_launch_welcome_email.
--
-- Apply on a Neon backup branch first. Do not point this at production
-- until that backup exists and the branch looks right.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f prisma/migrations/20261021190000_launch_intake/migration.sql

CREATE TABLE IF NOT EXISTS "LaunchIntake" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LaunchIntake_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LaunchIntake_purchaseId_key" ON "LaunchIntake"("purchaseId");

DO $$ BEGIN
  ALTER TABLE "LaunchIntake"
    ADD CONSTRAINT "LaunchIntake_purchaseId_fkey"
    FOREIGN KEY ("purchaseId") REFERENCES "LaunchPurchase"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
