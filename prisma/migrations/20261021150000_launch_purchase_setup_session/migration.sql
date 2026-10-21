-- Additive only.
-- Creates Launch purchase storage and the setup-session length setting.
-- Does not add columns to Booking or BookingSettings, so the $99
-- strategy-call flow keeps working if this file has not been applied yet.
--
-- Apply on a Neon backup branch first. Do not point this at production
-- until that backup exists and the branch looks right.
--
--   npx prisma migrate deploy
--
-- If this database was not created with Prisma Migrate, apply the file
-- directly instead of replaying older migrations:
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f prisma/migrations/20261021150000_launch_purchase_setup_session/migration.sql

CREATE TABLE IF NOT EXISTS "LaunchPurchase" (
    "id" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "stripeEventId" TEXT,
    "paymentLinkId" TEXT,
    "tier" TEXT NOT NULL,
    "offer" TEXT NOT NULL DEFAULT 'ai-teammate-launch',
    "amountTotal" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "buyerName" TEXT,
    "buyerEmail" TEXT,
    "buyerPhone" TEXT,
    "promoCode" TEXT,
    "bookingToken" TEXT NOT NULL,
    "adminNotifiedAt" TIMESTAMP(3),
    "notifyClaimedAt" TIMESTAMP(3),
    "livemode" BOOLEAN NOT NULL DEFAULT false,
    "bookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LaunchPurchase_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LaunchPurchase_stripeSessionId_key" ON "LaunchPurchase"("stripeSessionId");
CREATE UNIQUE INDEX IF NOT EXISTS "LaunchPurchase_stripeEventId_key" ON "LaunchPurchase"("stripeEventId");
CREATE UNIQUE INDEX IF NOT EXISTS "LaunchPurchase_bookingToken_key" ON "LaunchPurchase"("bookingToken");
CREATE UNIQUE INDEX IF NOT EXISTS "LaunchPurchase_bookingId_key" ON "LaunchPurchase"("bookingId");
CREATE INDEX IF NOT EXISTS "LaunchPurchase_buyerEmail_idx" ON "LaunchPurchase"("buyerEmail");
CREATE INDEX IF NOT EXISTS "LaunchPurchase_tier_idx" ON "LaunchPurchase"("tier");
CREATE INDEX IF NOT EXISTS "LaunchPurchase_createdAt_idx" ON "LaunchPurchase"("createdAt");

DO $$ BEGIN
  ALTER TABLE "LaunchPurchase"
    ADD CONSTRAINT "LaunchPurchase_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "LaunchSetupSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "slotLengthMin" INTEGER NOT NULL DEFAULT 90,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LaunchSetupSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "LaunchSetupSettings" ("id", "slotLengthMin", "createdAt", "updatedAt")
VALUES ('default', 90, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
