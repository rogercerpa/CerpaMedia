"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReplayScript } from "@/lib/demo-safety";

export type DemoSampleView = {
  id: string;
  label: string;
  inputText: string;
  cachedOutput: string | null;
};

export default function DemoPlayer({
  title,
  description,
  mode,
  restingMessage,
  replayScript,
  samples,
  capHit,
  killSwitch,
}: {
  title: string;
  description: string;
  mode: "samples" | "replay";
  restingMessage: string;
  replayScript: ReplayScript;
  samples: DemoSampleView[];
  capHit?: boolean;
  killSwitch?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [typed, setTyped] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => samples.find((sample) => sample.id === selectedId) ?? null,
    [samples, selectedId]
  );

  useEffect(() => {
    if (!playing) {
      setTyped("");
      return;
    }
    const target = replayScript.after;
    let i = 0;
    const step = Math.max(20, Math.floor(replayScript.durationMs / Math.max(target.length, 1)));
    const timer = setInterval(() => {
      i += 1;
      setTyped(target.slice(0, i));
      if (i >= target.length) {
        clearInterval(timer);
      }
    }, step);
    return () => clearInterval(timer);
  }, [playing, replayScript.after, replayScript.durationMs]);

  const fallbackNote = killSwitch
    ? "This demo is paused from the admin kill switch. Showing the recorded replay."
    : capHit
      ? restingMessage
      : null;

  return (
    <div className="border border-border p-6 md:p-8 bg-white">
      <h2 className="text-2xl font-semibold text-text mb-2">{title}</h2>
      <p className="text-[15px] text-text-muted mb-6">{description}</p>
      {fallbackNote ? (
        <p className="text-sm text-text mb-4 border border-border bg-bg-subtle px-3 py-2">
          {fallbackNote}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted mb-2">
            {replayScript.inputLabel}
          </p>
          <pre className="whitespace-pre-wrap text-sm text-text bg-bg-subtle p-4 min-h-[160px]">
            {selected ? selected.inputText : replayScript.before}
          </pre>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted mb-2">
            {replayScript.outputLabel}
          </p>
          <pre className="whitespace-pre-wrap text-sm text-text bg-bg-subtle p-4 min-h-[160px]">
            {selected
              ? selected.cachedOutput || "Sample output has not been generated yet."
              : playing
                ? typed
                : replayScript.after}
          </pre>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            setSelectedId(null);
            setPlaying(true);
          }}
          className="bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800"
        >
          Play recorded replay
        </button>
        {mode === "samples" && samples.length > 0 ? (
          samples.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => {
                setPlaying(false);
                setSelectedId(sample.id);
              }}
              className={`px-4 py-2 text-sm border ${
                selectedId === sample.id
                  ? "border-text bg-bg-subtle"
                  : "border-border hover:border-text-muted"
              }`}
            >
              {sample.label}
            </button>
          ))
        ) : null}
      </div>
      <p className="mt-4 text-xs text-text-muted">
        No free-text box. Visitors never trigger an AI call. We don&apos;t keep what you paste — and this demo doesn&apos;t ask you to paste anything.
      </p>
    </div>
  );
}
