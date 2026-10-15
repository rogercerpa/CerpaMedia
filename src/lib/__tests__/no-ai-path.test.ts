import { execFileSync } from "child_process";
import { describe, expect, it } from "vitest";
import { visitorCanTriggerAi } from "@/lib/demo-safety";

const FORBIDDEN = [
  "AI_GATEWAY",
  "ai-gateway.vercel.sh",
  "chat/completions",
  "generateSampleOutput",
  "callAiGateway",
  "DEMO_DAILY_SPEND",
  "DEMO_SPIKE",
  "DemoUsageDay",
  "estimateGenerationCost",
  "PhotoNeeded",
  "Photo needed from Roger",
];

describe("no live AI code path", () => {
  it("has no gateway, model-call, spend-cap, or photo-placeholder code in src", () => {
    expect(visitorCanTriggerAi()).toBe(false);
    let result = "";
    try {
      result = execFileSync(
        "rg",
        [
          "-n",
          "--glob",
          "!**/*.{test,spec}.{ts,tsx}",
          FORBIDDEN.join("|"),
          "src",
          ".env.example",
        ],
        { encoding: "utf8", cwd: process.cwd() }
      );
    } catch (error) {
      const failed = error as { status?: number; stdout?: string };
      if (failed.status !== 1) {
        throw error;
      }
      result = failed.stdout ?? "";
    }
    expect(result.trim()).toBe("");
  });
});
