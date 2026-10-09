import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminActor, jsonError } from "@/lib/admin-api";
import { getSiteFlags } from "@/lib/flags";

export async function GET() {
  const auth = await requireAdminActor();
  if ("response" in auth) return auth.response;
  const flags = await getSiteFlags();
  return NextResponse.json({ flags, role: auth.actor.role });
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
        demosPublicEnabled: Boolean(body.demosPublicEnabled),
        demoKillSwitch: Boolean(body.demoKillSwitch),
      },
      update: {
        foundationsUiEnabled: Boolean(body.foundationsUiEnabled),
        analyticsEnabled: Boolean(body.analyticsEnabled),
        demosPublicEnabled: Boolean(body.demosPublicEnabled),
        demoKillSwitch: Boolean(body.demoKillSwitch),
      },
    });

    return NextResponse.json({ flags });
  } catch (error) {
    console.error("Error updating demo settings:", error);
    return jsonError("Failed to update settings.", 500);
  }
}
