"use client";

import { useState } from "react";
import { CalendarBookingFlow } from "./CalendarBookingFlow";
import { LaunchIntakeForm } from "./LaunchIntakeForm";
import { bookingFieldsFromIntake, type IntakeAnswers } from "@/lib/launch-intake";

export function LaunchSetupExperience({
  token,
  durationMinutes,
  clientReference,
  buyerEmail,
  buyerName,
  buyerPhone,
  initialAnswers,
  intakeSubmitted,
}: {
  token: string;
  durationMinutes: number;
  clientReference: string;
  buyerEmail: string | null;
  buyerName: string | null;
  buyerPhone: string | null;
  initialAnswers: IntakeAnswers;
  intakeSubmitted: boolean;
}) {
  const seeded = seedPrefill(initialAnswers, buyerName, buyerEmail, buyerPhone);
  const [phase, setPhase] = useState<"intake" | "schedule">(intakeSubmitted ? "schedule" : "intake");
  const [answers, setAnswers] = useState<IntakeAnswers>(seeded);

  if (phase === "intake") {
    return (
      <LaunchIntakeForm
        token={token}
        clientReference={clientReference}
        buyerEmail={buyerEmail}
        initialAnswers={answers}
        onSubmitted={(next) => {
          setAnswers(next);
          setPhase("schedule");
        }}
      />
    );
  }

  const fields = bookingFieldsFromIntake(answers);

  return (
    <div>
      <div className="max-w-2xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-2">
            Step 2 of 3
          </p>
          <h2 className="text-3xl font-semibold text-text tracking-tight">Pick your setup time</h2>
          <p className="text-[15px] text-text-muted mt-2 leading-relaxed">
            Your intake is saved. Choose a {durationMinutes}-minute session. You can still edit your answers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPhase("intake")}
          className="min-h-11 border border-border px-4 py-3 text-[15px] font-medium text-text hover:bg-bg-subtle"
        >
          Edit intake answers
        </button>
      </div>
      <CalendarBookingFlow
        mode="launch_setup"
        launchToken={token}
        durationMinutes={durationMinutes}
        emailLocked
        confirmOnly
        prefill={{
          customerName: fields.customerName,
          customerEmail: fields.customerEmail,
          customerPhone: fields.customerPhone,
          customerCompany: fields.customerCompany,
          notes: fields.notes || "",
          platformPref: fields.platformPref || "",
        }}
      />
    </div>
  );
}

function seedPrefill(
  initial: IntakeAnswers,
  buyerName: string | null,
  buyerEmail: string | null,
  buyerPhone: string | null
): IntakeAnswers {
  return {
    ...initial,
    q2: text(initial.q2) || buyerName || "",
    q3: buyerEmail || text(initial.q3),
    q4: text(initial.q4) || buyerPhone || "",
  };
}

function text(value: IntakeAnswers[string] | undefined): string {
  return typeof value === "string" ? value : "";
}
