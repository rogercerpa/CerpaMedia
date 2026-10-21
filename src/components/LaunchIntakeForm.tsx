"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  INTAKE_SECTIONS,
  LAUNCH_INTAKE_INTRO,
  LAUNCH_INTAKE_PRIVACY,
  LAUNCH_INTAKE_TITLE,
  reviewIntake,
  sectionQuestions,
  visibleSections,
  type IntakeAnswers,
  type IntakeQuestion,
  type IntakeSection,
} from "@/lib/launch-intake";

export function LaunchIntakeForm({
  token,
  clientReference,
  buyerEmail,
  initialAnswers,
  onSubmitted,
}: {
  token: string;
  clientReference: string;
  buyerEmail: string | null;
  initialAnswers: IntakeAnswers;
  onSubmitted: (answers: IntakeAnswers) => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [answers, setAnswers] = useState<IntakeAnswers>(() =>
    seedAnswers(initialAnswers, clientReference, buyerEmail)
  );
  const [sectionId, setSectionId] = useState<IntakeSection["id"]>("A");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [website, setWebsite] = useState("");
  const sections = visibleSections(answers);
  const section = sections.find((item) => item.id === sectionId) ?? sections[0];
  const sectionIndex = Math.max(0, sections.findIndex((item) => item.id === section.id));
  const questions = sectionQuestions(section, answers);
  const emailLocked = Boolean(buyerEmail);

  useEffect(() => {
    if (!sections.some((item) => item.id === sectionId)) {
      setSectionId("E");
    }
  }, [sectionId, sections]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [section.id]);

  const save = async (mode: "draft" | "section" | "submit") => {
    setSaving(true);
    setStatus(null);
    try {
      const response = await fetch("/api/booking/launch-setup/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          answers,
          submit: mode === "submit",
          sectionId: mode === "section" ? section.id : undefined,
          website,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErrors(data.fields || {});
        setStatus(data.error || "Could not save your answers.");
        return false;
      }
      const saved = seedAnswers(data.answers || answers, clientReference, buyerEmail);
      setAnswers(saved);
      setErrors({});
      if (mode === "submit") {
        onSubmitted(saved);
        return true;
      }
      if (mode === "draft") {
        setStatus("Saved. You can close this page and come back with the same link.");
      } else {
        setStatus(null);
      }
      return true;
    } catch {
      setStatus("Could not save your answers. Check your connection and try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const goForward = async () => {
    const next = sections[sectionIndex + 1];
    const ok = await save(next ? "section" : "submit");
    if (!ok) return;
    if (next) setSectionId(next.id);
  };

  const goBack = () => {
    const previous = sections[sectionIndex - 1];
    if (previous) setSectionId(previous.id);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-3">
          Step 1 of 3 · Section {section.id}
        </p>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-3xl md:text-4xl font-semibold text-text tracking-tight outline-none"
        >
          {LAUNCH_INTAKE_TITLE}
        </h2>
        <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-text-muted">
          {LAUNCH_INTAKE_INTRO.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p className="text-text">{LAUNCH_INTAKE_PRIVACY}</p>
        </div>
      </div>

      <div
        className="mb-6"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={sections.length}
        aria-valuenow={sectionIndex + 1}
        aria-label={`Section ${sectionIndex + 1} of ${sections.length}`}
      >
        <div className="flex justify-between text-[11px] uppercase tracking-wider text-text-muted mb-2">
          <span>{section.title}</span>
          <span>
            {sectionIndex + 1} of {sections.length}
          </span>
        </div>
        <div className="h-1 bg-border">
          <div
            className="h-1 bg-text"
            style={{ width: `${((sectionIndex + 1) / sections.length) * 100}%` }}
          />
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void goForward();
        }}
        className="border border-border bg-white p-4 sm:p-8 space-y-8"
      >
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Website (leave blank)</label>
          <input
            id="website"
            name="website"
            type="text"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {status ? (
          <p role="status" className="border border-border bg-bg-subtle px-4 py-3 text-sm text-text">
            {status}
          </p>
        ) : null}

        {Object.keys(errors).length > 0 ? (
          <div role="alert" className="border border-red-500 bg-red-50 px-4 py-3 text-sm text-red-900">
            Please check the highlighted questions.
          </div>
        ) : null}

        <fieldset className="space-y-8">
          <legend className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-4">
            {section.title}
          </legend>
          {questions.map((question) => (
            <QuestionField
              key={question.id}
              question={question}
              answers={answers}
              error={errors[question.id] || errors[`${question.id}Other`]}
              emailLocked={emailLocked && question.id === "q3"}
              onChange={(next) => {
                setAnswers(next);
                setErrors((current) => {
                  const copy = { ...current };
                  delete copy[question.id];
                  delete copy[`${question.id}Other`];
                  return copy;
                });
              }}
            />
          ))}
        </fieldset>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          {sectionIndex > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="min-h-11 border border-border px-4 py-3 text-[15px] font-medium text-text hover:bg-bg-subtle"
            >
              Back
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void save("draft")}
            disabled={saving}
            className="min-h-11 border border-border px-4 py-3 text-[15px] font-medium text-text hover:bg-bg-subtle disabled:opacity-60"
          >
            Save and finish later
          </button>
          <button
            type="submit"
            disabled={saving}
            className="min-h-11 sm:ml-auto bg-cta text-cta-text px-4 py-3 text-[15px] font-medium hover:bg-cta-hover disabled:opacity-60"
          >
            {saving ? "Saving..." : sectionIndex === sections.length - 1 ? "Save intake and pick a time" : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}

function QuestionField({
  question,
  answers,
  error,
  emailLocked,
  onChange,
}: {
  question: IntakeQuestion;
  answers: IntakeAnswers;
  error?: string;
  emailLocked: boolean;
  onChange: (answers: IntakeAnswers) => void;
}) {
  const reactId = useId();
  const inputId = `${reactId}-${question.id}`;
  const describedBy = [
    question.description ? `${inputId}-hint` : "",
    error ? `${inputId}-error` : "",
  ]
    .filter(Boolean)
    .join(" ") || undefined;
  const value = answers[question.id];
  const otherValue = typeof answers[`${question.id}Other`] === "string" ? answers[`${question.id}Other`] : "";

  const setText = (next: string) => onChange({ ...answers, [question.id]: next });
  const setOther = (next: string) => onChange({ ...answers, [`${question.id}Other`]: next });

  return (
    <div>
      {question.type === "choice" || question.type === "checkboxes" ? (
        <fieldset aria-describedby={describedBy}>
          <legend className="text-[15px] font-medium text-text mb-1">
            {question.title}
            {question.required ? <span className="text-text-muted"> (required)</span> : null}
          </legend>
          {question.description ? (
            <p id={`${inputId}-hint`} className="text-sm text-text-muted mb-3 leading-relaxed">
              {question.description}
            </p>
          ) : null}
          <div className="space-y-2">
            {(question.options ?? []).map((option) => (
              <OptionRow
                key={option}
                question={question}
                option={option}
                answers={answers}
                onChange={onChange}
              />
            ))}
            {question.allowOther ? (
              <OptionRow question={question} option="Other" answers={answers} onChange={onChange} />
            ) : null}
          </div>
        </fieldset>
      ) : (
        <>
          <label htmlFor={inputId} className="block text-[15px] font-medium text-text mb-1">
            {question.title}
            {question.required ? <span className="text-text-muted"> (required)</span> : null}
          </label>
          {question.description ? (
            <p id={`${inputId}-hint`} className="text-sm text-text-muted mb-3 leading-relaxed">
              {question.description}
            </p>
          ) : null}
          {question.type === "paragraph" ? (
            <textarea
              id={inputId}
              value={typeof value === "string" ? value : ""}
              onChange={(event) => setText(event.target.value)}
              rows={5}
              maxLength={question.maxLength}
              aria-invalid={Boolean(error)}
              aria-describedby={describedBy}
              className={inputClass(Boolean(error))}
            />
          ) : (
            <input
              id={inputId}
              type={question.type === "email" ? "email" : question.type === "phone" ? "tel" : question.type === "date" ? "date" : "text"}
              value={typeof value === "string" ? value : ""}
              onChange={(event) => setText(event.target.value)}
              readOnly={question.readOnly || emailLocked}
              maxLength={question.maxLength}
              autoComplete={autocompleteFor(question.id)}
              aria-invalid={Boolean(error)}
              aria-describedby={describedBy}
              aria-readonly={question.readOnly || emailLocked || undefined}
              className={inputClass(Boolean(error), question.readOnly || emailLocked)}
            />
          )}
        </>
      )}

      {question.allowOther && showsOther(question, answers) ? (
        <div className="mt-3">
          <label htmlFor={`${inputId}-other`} className="block text-sm font-medium text-text mb-1">
            Other, please name it
          </label>
          <input
            id={`${inputId}-other`}
            type="text"
            value={otherValue}
            onChange={(event) => setOther(event.target.value)}
            maxLength={120}
            className={inputClass(Boolean(error))}
          />
        </div>
      ) : null}

      {error ? (
        <p id={`${inputId}-error`} className="text-red-600 text-sm mt-2">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function OptionRow({
  question,
  option,
  answers,
  onChange,
}: {
  question: IntakeQuestion;
  option: string;
  answers: IntakeAnswers;
  onChange: (answers: IntakeAnswers) => void;
}) {
  const selected = isSelected(question, answers, option);
  const name = `intake-${question.id}`;
  const toggle = () => {
    if (question.type === "choice") {
      onChange({ ...answers, [question.id]: option });
      return;
    }
    const raw = answers[question.id];
    const current: string[] = Array.isArray(raw) ? raw : [];
    if (current.includes(option)) {
      onChange({ ...answers, [question.id]: current.filter((item) => item !== option) });
      return;
    }
    if (question.maxChoices && current.length >= question.maxChoices) return;
    onChange({ ...answers, [question.id]: [...current, option] });
  };

  return (
    <label className="flex items-start gap-3 min-h-11 border border-border px-3 py-3 text-[15px] text-text cursor-pointer hover:bg-bg-subtle">
      <input
        type={question.type === "choice" ? "radio" : "checkbox"}
        name={name}
        value={option}
        checked={selected}
        onChange={toggle}
        className="mt-1 h-4 w-4 shrink-0"
      />
      <span>{option}</span>
    </label>
  );
}

function isSelected(question: IntakeQuestion, answers: IntakeAnswers, option: string): boolean {
  const value = answers[question.id];
  if (Array.isArray(value)) return value.includes(option);
  return value === option;
}

function showsOther(question: IntakeQuestion, answers: IntakeAnswers): boolean {
  return isSelected(question, answers, "Other");
}

function inputClass(invalid: boolean, locked = false): string {
  return `w-full border ${invalid ? "border-red-500" : "border-border"} px-4 py-3 text-base text-text focus:outline-none focus:border-text-muted bg-transparent ${locked ? "bg-bg-subtle" : ""}`;
}

function autocompleteFor(id: string): string | undefined {
  if (id === "q1") return "organization";
  if (id === "q2") return "name";
  if (id === "q3") return "email";
  if (id === "q4") return "tel";
  return "off";
}

function seedAnswers(
  initial: IntakeAnswers,
  clientReference: string,
  buyerEmail: string | null
): IntakeAnswers {
  const review = reviewIntake({
    answers: {
      ...initial,
      q0: clientReference,
      q2: textOr(initial.q2, ""),
      q3: buyerEmail || textOr(initial.q3, ""),
      q4: textOr(initial.q4, ""),
    },
    mode: "draft",
    clientReference,
    buyerEmail,
  });
  const seeded = { ...review.answers };
  if (!seeded.q2 && typeof initial.q2 === "string") seeded.q2 = initial.q2;
  if (buyerEmail) seeded.q3 = buyerEmail;
  else if (!seeded.q3 && typeof initial.q3 === "string") seeded.q3 = initial.q3;
  if (!seeded.q4 && typeof initial.q4 === "string") seeded.q4 = initial.q4;
  seeded.q0 = clientReference;
  return seeded;
}

function textOr(value: IntakeAnswers[string] | undefined, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}
