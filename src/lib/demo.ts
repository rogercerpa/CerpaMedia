import { prisma } from "./prisma";
import {
  canServePublicDemo,
  publicDemoMode,
  type PublicDemoMode,
  type ReplayScript,
} from "./demo-safety";
import { getSiteFlags } from "./flags";

export type { ReplayScript };

export function parseReplayScript(value: unknown): ReplayScript {
  const raw = (value ?? {}) as Partial<ReplayScript>;
  return {
    inputLabel: raw.inputLabel || "Before",
    outputLabel: raw.outputLabel || "After",
    before: raw.before || "",
    after: raw.after || "",
    durationMs: raw.durationMs || 4000,
  };
}

type DemoWithSamples = {
  slug: string;
  title: string;
  description: string;
  enabled: boolean;
  status: string;
  restingMessage: string;
  replayScript: unknown;
  samples: {
    id: string;
    label: string;
    inputText: string;
    cachedOutput: string | null;
  }[];
};

export type DemoPayload = {
  slug: string;
  title: string;
  description: string;
  mode: PublicDemoMode;
  killSwitch: boolean;
  restingMessage: string;
  replayScript: ReplayScript;
  samples: {
    id: string;
    label: string;
    inputText: string;
    cachedOutput: string | null;
  }[];
};

async function loadDemoBySlug(slug: string) {
  return prisma.demo.findUnique({
    where: { slug },
    include: {
      samples: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function buildDemoPayload(
  demo: DemoWithSamples,
  options: { forceReplay?: boolean } = {}
): Promise<DemoPayload> {
  const flags = await getSiteFlags();
  const mode: PublicDemoMode = options.forceReplay
    ? "replay"
    : publicDemoMode({ killSwitch: flags.demoKillSwitch });

  const samples =
    mode === "samples"
      ? demo.samples.map((sample) => ({
          id: sample.id,
          label: sample.label,
          inputText: sample.inputText,
          cachedOutput: sample.cachedOutput,
        }))
      : [];

  return {
    slug: demo.slug,
    title: demo.title,
    description: demo.description,
    mode,
    killSwitch: flags.demoKillSwitch || Boolean(options.forceReplay),
    restingMessage: demo.restingMessage,
    replayScript: parseReplayScript(demo.replayScript),
    samples,
  };
}

export async function getPublicDemoPayload(slug: string) {
  const demo = await loadDemoBySlug(slug);
  if (!demo) {
    return null;
  }

  const flags = await getSiteFlags();
  if (
    !canServePublicDemo({
      enabled: demo.enabled,
      status: demo.status,
      demosPublicEnabled: flags.demosPublicEnabled,
    })
  ) {
    return null;
  }

  return buildDemoPayload(demo);
}

export async function getAdminDemoPayload(
  slug: string,
  options: { forceReplay?: boolean } = {}
) {
  const demo = await loadDemoBySlug(slug);
  if (!demo) {
    return null;
  }
  return buildDemoPayload(demo, options);
}
