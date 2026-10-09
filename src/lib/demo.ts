import { prisma } from "./prisma";
import { promptForDemo } from "./demo-prompts";
import {
  canGenerate,
  canServePublicDemo,
  estimateGenerationCostUsd,
  publicDemoMode,
  utcDateKey,
  type PublicDemoMode,
  type ReplayScript,
} from "./demo-safety";

export type { ReplayScript };
import { getSiteFlags } from "./flags";
import { OWNER_EMAIL } from "./roles";
import { Resend } from "resend";

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

export async function getUsageForToday(now = new Date()) {
  const date = utcDateKey(now);
  try {
    const row = await prisma.demoUsageDay.findUnique({ where: { date } });
    return {
      date,
      spendUsd: row?.spendUsd ?? 0,
      generationCount: row?.generationCount ?? 0,
    };
  } catch (error) {
    console.error("Failed to load demo usage:", error);
    return { date, spendUsd: 0, generationCount: 0 };
  }
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
  capHit: boolean;
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
  const usage = await getUsageForToday();
  const mode: PublicDemoMode = options.forceReplay
    ? "replay"
    : publicDemoMode({
        killSwitch: flags.demoKillSwitch,
        spendUsd: usage.spendUsd,
        capUsd: flags.demoDailySpendCapUsd,
      });

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
    killSwitch: flags.demoKillSwitch,
    capHit: mode === "replay" && !flags.demoKillSwitch,
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

type GatewayResult = {
  text: string;
  inputTokens?: number;
  outputTokens?: number;
};

async function callAiGateway(args: {
  system: string;
  user: string;
}): Promise<GatewayResult> {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  const model = process.env.AI_GATEWAY_MODEL || "openai/gpt-4o-mini";
  const baseUrl = (
    process.env.AI_GATEWAY_URL || "https://ai-gateway.vercel.sh/v1"
  ).replace(/\/$/, "");

  if (!apiKey) {
    throw new Error("AI_GATEWAY_API_KEY is not set");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 400,
      messages: [
        { role: "system", content: args.system },
        { role: "user", content: args.user },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`AI Gateway error (${response.status}): ${body.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("AI Gateway returned an empty draft");
  }

  return {
    text,
    inputTokens: data.usage?.prompt_tokens,
    outputTokens: data.usage?.completion_tokens,
  };
}

async function maybeSendSpikeAlert(generationCount: number) {
  const flags = await getSiteFlags();
  if (generationCount < flags.demoSpikeAlertThreshold) {
    return;
  }

  const today = utcDateKey();
  const alreadySentToday =
    flags.demoLastAlertSentAt &&
    utcDateKey(flags.demoLastAlertSentAt) === today;
  if (alreadySentToday) {
    return;
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn("Spike alert skipped: RESEND_API_KEY is not set");
    return;
  }

  const resend = new Resend(resendKey);
  const fromEmail = process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";

  await resend.emails.send({
    from: fromEmail,
    to: OWNER_EMAIL,
    subject: "CerpaMedia demo usage spike",
    html: `<p>Demo sample generation hit ${generationCount} runs today (threshold ${flags.demoSpikeAlertThreshold}). Generation is admin-only. No visitor AI path exists.</p>`,
  });

  await prisma.siteSetting.update({
    where: { id: "default" },
    data: { demoLastAlertSentAt: new Date() },
  });
}

export async function generateSampleOutput(args: {
  sampleId: string;
  isAdmin: boolean;
}) {
  const flags = await getSiteFlags();
  const usage = await getUsageForToday();
  const gate = canGenerate({
    killSwitch: flags.demoKillSwitch,
    spendUsd: usage.spendUsd,
    capUsd: flags.demoDailySpendCapUsd,
    isAdmin: args.isAdmin,
  });

  if (!gate.ok) {
    return gate;
  }

  const sample = await prisma.demoSample.findUnique({
    where: { id: args.sampleId },
    include: { demo: true },
  });

  if (!sample) {
    return { ok: false as const, error: "Sample not found.", status: 404 };
  }

  const prompt = promptForDemo(sample.demo.slug);
  const result = await callAiGateway({
    system: prompt.system,
    user: `${prompt.userPrefix}${sample.inputText}`,
  });

  const cost = estimateGenerationCostUsd({
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  });

  const updated = await prisma.demoSample.update({
    where: { id: sample.id },
    data: {
      cachedOutput: result.text,
      generatedAt: new Date(),
    },
  });

  const day = await prisma.demoUsageDay.upsert({
    where: { date: usage.date },
    create: {
      date: usage.date,
      spendUsd: cost,
      generationCount: 1,
    },
    update: {
      spendUsd: { increment: cost },
      generationCount: { increment: 1 },
    },
  });

  await maybeSendSpikeAlert(day.generationCount);

  return {
    ok: true as const,
    sample: {
      id: updated.id,
      cachedOutput: updated.cachedOutput,
      generatedAt: updated.generatedAt,
    },
    usage: {
      date: day.date,
      spendUsd: day.spendUsd,
      generationCount: day.generationCount,
    },
  };
}
