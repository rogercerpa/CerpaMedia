import { prisma } from "./prisma";

export type SiteFlags = {
  foundationsUiEnabled: boolean;
  analyticsEnabled: boolean;
  demosPublicEnabled: boolean;
  demoKillSwitch: boolean;
  demoDailySpendCapUsd: number;
  demoSpikeAlertThreshold: number;
  demoLastAlertSentAt: Date | null;
};

export const DEFAULT_SITE_FLAGS: SiteFlags = {
  foundationsUiEnabled: false,
  analyticsEnabled: false,
  demosPublicEnabled: false,
  demoKillSwitch: false,
  demoDailySpendCapUsd: Number(process.env.DEMO_DAILY_SPEND_CAP_USD || "5"),
  demoSpikeAlertThreshold: Number(
    process.env.DEMO_SPIKE_ALERT_THRESHOLD || "8"
  ),
  demoLastAlertSentAt: null,
};

export async function getSiteFlags(): Promise<SiteFlags> {
  try {
    const row = await prisma.siteSetting.findUnique({
      where: { id: "default" },
    });
    if (!row) {
      return DEFAULT_SITE_FLAGS;
    }
    return {
      foundationsUiEnabled: row.foundationsUiEnabled,
      analyticsEnabled: row.analyticsEnabled,
      demosPublicEnabled: Boolean(row.demosPublicEnabled),
      demoKillSwitch: row.demoKillSwitch,
      demoDailySpendCapUsd: row.demoDailySpendCapUsd,
      demoSpikeAlertThreshold: row.demoSpikeAlertThreshold,
      demoLastAlertSentAt: row.demoLastAlertSentAt,
    };
  } catch (error) {
    console.error("Failed to load site flags:", error);
    return DEFAULT_SITE_FLAGS;
  }
}

export async function isFoundationsUiEnabled(): Promise<boolean> {
  const flags = await getSiteFlags();
  return flags.foundationsUiEnabled;
}

export async function isAnalyticsEnabled(): Promise<boolean> {
  const flags = await getSiteFlags();
  return flags.analyticsEnabled;
}
