import { prisma } from "./prisma";
import { isMissingRelationError } from "./db-errors";
import {
  DEFAULT_LAUNCH_SETUP_LENGTH_MIN,
} from "./launch-booking-shared";

export async function getLaunchSetupLengthMin(): Promise<number> {
  try {
    const row = await prisma.launchSetupSettings.findUnique({
      where: { id: "default" },
    });
    if (
      row &&
      Number.isInteger(row.slotLengthMin) &&
      row.slotLengthMin >= 15 &&
      row.slotLengthMin <= 480
    ) {
      return row.slotLengthMin;
    }
  } catch (error) {
    if (!isMissingRelationError(error)) throw error;
  }
  return DEFAULT_LAUNCH_SETUP_LENGTH_MIN;
}

export async function saveLaunchSetupLengthMin(minutes: number): Promise<number> {
  const row = await prisma.launchSetupSettings.upsert({
    where: { id: "default" },
    create: { id: "default", slotLengthMin: minutes },
    update: { slotLengthMin: minutes },
  });
  return row.slotLengthMin;
}
