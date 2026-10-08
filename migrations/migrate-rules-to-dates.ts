/**
 * Migration Script: Convert AvailabilityRule to DateAvailability
 * 
 * ⚠️ IMPORTANT: Do NOT run this against production without approval from Roger.
 * 
 * This script converts weekly recurring rules (AvailabilityRule) into explicit
 * date-specific availability (DateAvailability) for the next 90 days.
 * 
 * Usage:
 *   tsx migrations/migrate-rules-to-dates.ts
 * 
 * Prerequisites:
 *   - DATABASE_URL set in .env or .env.local
 *   - Roger's approval
 *   - Database backup
 */

import { PrismaClient } from "@prisma/client";
import { addDays, format, getDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const prisma = new PrismaClient();

async function migrateRulesToDates() {
  console.log("Starting migration: AvailabilityRule → DateAvailability");
  console.log("========================================\n");

  // 1. Fetch all availability rules
  const rules = await prisma.availabilityRule.findMany();
  
  if (rules.length === 0) {
    console.log("No AvailabilityRule records found. Nothing to migrate.");
    return;
  }

  console.log(`Found ${rules.length} AvailabilityRule records:\n`);
  rules.forEach(rule => {
    const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][rule.weekday];
    console.log(`  - ${dayName}: ${rule.startTime} - ${rule.endTime} (${rule.timezone})`);
  });
  console.log("");

  // 2. Get existing blocked dates
  const blockedDates = await prisma.blockedDate.findMany();
  const blockedDateStrings = new Set(
    blockedDates.map(bd => format(bd.date, "yyyy-MM-dd"))
  );

  // 3. Get existing DateAvailability records to avoid duplicates
  const existingAvails = await prisma.dateAvailability.findMany();
  const existingAvailKeys = new Set(
    existingAvails.map(a => `${format(a.date, "yyyy-MM-dd")}_${a.startTime}_${a.endTime}`)
  );

  // 4. Generate dates for next 90 days
  const startDate = new Date();
  const endDate = addDays(startDate, 90);
  
  const dateAvailsToCreate: Array<{
    date: Date;
    startTime: string;
    endTime: string;
    timezone: string;
  }> = [];

  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const weekday = getDay(currentDate); // 0 = Sunday, 6 = Saturday
    const dateStr = format(currentDate, "yyyy-MM-dd");
    
    // Check if this date is blocked
    if (!blockedDateStrings.has(dateStr)) {
      // Find matching rules for this weekday
      const matchingRules = rules.filter(r => r.weekday === weekday);
      
      for (const rule of matchingRules) {
        const key = `${dateStr}_${rule.startTime}_${rule.endTime}`;
        
        // Only create if it doesn't already exist
        if (!existingAvailKeys.has(key)) {
          // Convert to noon UTC to avoid timezone shift
          const dateAtNoon = new Date(`${dateStr}T12:00:00.000Z`);
          
          dateAvailsToCreate.push({
            date: dateAtNoon,
            startTime: rule.startTime,
            endTime: rule.endTime,
            timezone: rule.timezone,
          });
        }
      }
    }
    
    currentDate = addDays(currentDate, 1);
  }

  console.log(`\nWill create ${dateAvailsToCreate.length} new DateAvailability records.`);
  console.log(`(Skipped ${existingAvails.length} existing records to avoid duplicates.)\n`);

  if (dateAvailsToCreate.length === 0) {
    console.log("Nothing to create. Exiting.");
    return;
  }

  // 5. Prompt for confirmation
  console.log("⚠️  WARNING: This will modify the database.");
  console.log("Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n");
  
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 6. Create DateAvailability records in batches
  console.log("Creating DateAvailability records...");
  
  const batchSize = 50;
  for (let i = 0; i < dateAvailsToCreate.length; i += batchSize) {
    const batch = dateAvailsToCreate.slice(i, i + batchSize);
    await prisma.dateAvailability.createMany({
      data: batch,
      skipDuplicates: true,
    });
    console.log(`  Created batch ${Math.floor(i / batchSize) + 1} (${batch.length} records)`);
  }

  console.log(`\n✅ Successfully created ${dateAvailsToCreate.length} DateAvailability records.`);

  // 7. Optional: Delete AvailabilityRule records
  console.log("\nAvailabilityRule records still exist in the database.");
  console.log("To delete them (optional), run:");
  console.log("  DELETE FROM \"AvailabilityRule\";");
  console.log("\nOr keep them as historical data (they won't be used by the app).\n");
}

migrateRulesToDates()
  .catch(error => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
