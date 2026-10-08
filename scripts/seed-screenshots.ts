import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.checkoutHold.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.blockedDate.deleteMany();
  await prisma.dateAvailability.deleteMany();
  await prisma.availabilityRule.deleteMany();
  await prisma.bookingSettings.deleteMany();

  // Create legacy AvailabilityRule records (will be ignored by app)
  console.log('Creating legacy AvailabilityRule records...');
  await prisma.availabilityRule.createMany({
    data: [
      { weekday: 1, startTime: '10:00', endTime: '16:00', timezone: 'America/New_York' }, // Monday
      { weekday: 2, startTime: '10:00', endTime: '16:00', timezone: 'America/New_York' }, // Tuesday
      { weekday: 3, startTime: '10:00', endTime: '16:00', timezone: 'America/New_York' }, // Wednesday
      { weekday: 4, startTime: '10:00', endTime: '16:00', timezone: 'America/New_York' }, // Thursday
      { weekday: 5, startTime: '10:00', endTime: '16:00', timezone: 'America/New_York' }, // Friday
    ],
  });

  // Create BookingSettings
  console.log('Creating BookingSettings...');
  await prisma.bookingSettings.create({
    data: {
      slotLengthMin: 45,
      bufferMin: 30,
      minLeadTimeHrs: 24,
    },
  });

  // Create one BlockedDate
  console.log('Creating BlockedDate...');
  await prisma.blockedDate.create({
    data: {
      date: new Date('2026-10-25T12:00:00.000Z'), // Oct 25, 2026
      reason: 'Holiday',
    },
  });

  console.log('✅ Seeding complete!');
  console.log('- 5 AvailabilityRule records (legacy, ignored by app)');
  console.log('- 0 DateAvailability records initially');
  console.log('- 1 BlockedDate record (Oct 25)');
  console.log('- 1 BookingSettings record');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
