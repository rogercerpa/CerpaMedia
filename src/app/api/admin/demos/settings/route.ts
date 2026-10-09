import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminActor, jsonError } from "@/lib/admin-api";
import { getSiteFlags } from "@/lib/flags";
import { getUsageForToday } from "@/lib/demo";

export async function GET() {
  const auth = await requireAdminActor();
  if ("response" in auth) return auth.response;
  const [flags, usage] = await Promise.all([getSiteFlags(), getUsageForToday()]);
  return NextResponse.json({ flags, usage, role: auth.actor.role });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminActor();
  if ("response" in auth) return auth.response;

  if (auth.actor.role !== "owner") {
    return jsonError("Only the owner can change demo safety settings.", 403);
  }

  try {
    const body = await request.json();
    const flags = await prisma.siteSetting.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        foundationsUiEnabled: Boolean(body.foundationsUiEnabled),
        analyticsEnabled: Boolean(body.analyticsEnabled),
        demoKillSwitch: Boolean(body.demoKillSwitch),
        demoDailySpendCapUsd: Number(body.demoDailySpendCapUsd ?? 5),
        demoSpikeAlertThreshold: Number(body.demoSpikeAlertThreshold ?? 8),
      },
      update: {
        foundationsUiEnabled: Boolean(body.foundationsUiEnabled),
        analyticsEnabled: Boolean(body.analyticsEnabled),
        demoKillSwitch: Boolean(body.demoKillSwitch),
        demoDailySpendCapUsd: Number(body.demoDailySpendCapUsd ?? 5),
        demoSpikeAlertThreshold: Number(body.demoSpikeAlertThreshold ?? 8),
      },
    });

    const usage = await getUsageForToday();
    return NextResponse.json({ flags, usage });
  } catch (error) {
    console.error("Error updating demo settings:", error);
    return jsonError("Failed to update settings.", 500);
  }
}
