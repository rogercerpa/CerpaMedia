import { stripHtmlAndScripts, validateEmail, validatePhone } from "./security";
import { LAUNCH_SETUP_LABEL, type LaunchSetupPlatform } from "./launch-booking-shared";

export const LAUNCH_INTAKE_TITLE = "AI Teammate Launch: Intake";

export const LAUNCH_INTAKE_INTRO = [
  "Thanks for starting your AI Teammate Launch. This takes about 15 minutes. Please don't enter any passwords. We'll never ask for them.",
  "Your answers help us pick the right tool and your two AI teammates. Roger reviews them before your setup session. If you haven't picked your session time yet, use the booking link in your welcome email.",
] as const;

export const LAUNCH_INTAKE_PRIVACY =
  "Please don't enter passwords, API keys, or card numbers. We'll never ask for them.";

export const LAUNCH_INTAKE_CONFIRMATION =
  "Thanks! Roger will review your answers before your setup session. If you haven't picked your session time yet, use the booking link in your welcome email. Please don't send any passwords; we'll never ask for them. Questions? Reply to your welcome email or call (943) 248-7410.";

export const LAUNCH_IN_PERSON =
  "In person (one 2-hour visit, if you're within 60 minutes of Woodstock, GA)";
export const LAUNCH_VIRTUAL = "Virtual (two 1-hour sessions)";

const SHORT = 200;
const PARAGRAPH = 4000;

export type IntakeValue = string | string[];
export type IntakeAnswers = Record<string, IntakeValue>;

export interface IntakeQuestion {
  id: string;
  title: string;
  type: "short" | "paragraph" | "email" | "phone" | "choice" | "checkboxes" | "date";
  required: boolean;
  description?: string;
  options?: readonly string[];
  allowOther?: boolean;
  maxChoices?: number;
  maxLength: number;
  readOnly?: boolean;
  showIf?: (answers: IntakeAnswers) => boolean;
}

export const INTAKE_QUESTIONS: readonly IntakeQuestion[] = [
  {
    id: "q0",
    title: "Client reference (filled in for you; please leave as is)",
    type: "short",
    required: false,
    maxLength: 40,
    readOnly: true,
  },
  {
    id: "q1",
    title: "Business name",
    type: "short",
    required: true,
    maxLength: SHORT,
  },
  {
    id: "q2",
    title: "Your name and role",
    type: "short",
    required: true,
    maxLength: SHORT,
  },
  {
    id: "q3",
    title: "Best email",
    type: "email",
    required: true,
    maxLength: 254,
  },
  {
    id: "q4",
    title: "Phone (optional)",
    type: "phone",
    required: false,
    description: "We only use this for phone calls.",
    maxLength: 20,
  },
  {
    id: "q5",
    title: "How should we reach you about scheduling?",
    type: "choice",
    required: true,
    options: ["Email", "Phone call"],
    maxLength: SHORT,
  },
  {
    id: "q6",
    title: "What does your business do, in one or two sentences?",
    type: "paragraph",
    required: true,
    maxLength: PARAGRAPH,
  },
  {
    id: "q7",
    title: "Including you, how many people will use or approve the AI teammates?",
    type: "choice",
    required: true,
    options: ["Only me", "2", "3", "4", "5 or more"],
    maxLength: SHORT,
  },
  {
    id: "q8",
    title: "Business location for in-person visits (street or city + ZIP)",
    type: "short",
    required: false,
    description:
      "Only used to check whether you're within our 60-minute in-person radius. Skip it if you'd rather launch virtually.",
    maxLength: SHORT,
  },
  {
    id: "q9",
    title:
      "List up to 5 repetitive tasks that eat your week. For each one: the task, how many times a week you do it, and about how many minutes it takes each time.",
    type: "paragraph",
    required: true,
    description: "Example: Writing quotes · 6 times a week · 20 minutes each",
    maxLength: PARAGRAPH,
  },
  {
    id: "q10",
    title: "Which of these would help most? (Check up to 3.)",
    type: "checkboxes",
    required: false,
    maxChoices: 3,
    options: [
      "Inbox triage",
      "Morning brief",
      "Quote drafts",
      "Review replies / Google Business Profile posts",
      "Social drafts",
      "Invoice reminders",
      "Lead intake",
      "Not sure, recommend for me",
    ],
    maxLength: SHORT,
  },
  {
    id: "q11",
    title: 'What would a "good week" look like 30 days from now?',
    type: "paragraph",
    required: false,
    maxLength: PARAGRAPH,
  },
  {
    id: "q12",
    title: "Email and calendar",
    type: "choice",
    required: true,
    allowOther: true,
    options: ["Google Workspace / Gmail", "Microsoft 365 / Outlook"],
    maxLength: SHORT,
  },
  {
    id: "q13",
    title: "Other tools you use",
    type: "checkboxes",
    required: false,
    allowOther: true,
    options: [
      "QuickBooks",
      "Square",
      "Stripe",
      "Google Business Profile",
      "Facebook/Instagram",
      "Jobber/Housecall Pro",
      'CRM (please name it in "Other")',
    ],
    maxLength: SHORT,
  },
  {
    id: "q14",
    title: "AI tools you already pay for",
    type: "checkboxes",
    required: false,
    allowOther: true,
    options: [
      "Grok Bot",
      "Cursor (Pro / Teams)",
      "OpenAI (ChatGPT/Dots)",
      "Meta Muse",
      "Claude (Pro/Max/Team)",
      "None",
    ],
    maxLength: SHORT,
  },
  {
    id: "q15",
    title: "Your preference for the AI tool",
    type: "choice",
    required: false,
    options: ["Use one I already have (listed above)", "No preference, recommend one"],
    maxLength: SHORT,
  },
  {
    id: "q16",
    title: "Computer(s) the teammates will run on",
    type: "checkboxes",
    required: false,
    allowOther: true,
    options: ["Mac", "Windows", "Chromebook", "Linux"],
    maxLength: SHORT,
  },
  {
    id: "q17",
    title: "Would anyone besides you approve the teammates' work? (Name and role)",
    type: "short",
    required: false,
    maxLength: SHORT,
  },
  {
    id: "q17a",
    title: "Does your team use Slack?",
    type: "choice",
    required: true,
    description: "Used only to check whether a shared Team Bot fits how you and your team work.",
    options: ["Yes", "No"],
    maxLength: SHORT,
  },
  {
    id: "q18",
    title: "What must an AI never do without asking you first?",
    type: "paragraph",
    required: false,
    description:
      "These are always on and can't be turned off: send anything, spend money, publish anything, delete anything, change who has access, accept any terms. Add anything else here.",
    maxLength: PARAGRAPH,
  },
  {
    id: "q19",
    title: "Is any of your data sensitive (health, legal, financial, or children's data)?",
    type: "choice",
    required: true,
    options: ["Yes", "No", "Not sure"],
    maxLength: SHORT,
  },
  {
    id: "q19b",
    title: "If yes or not sure, describe it briefly. Please don't include the data itself.",
    type: "paragraph",
    required: false,
    maxLength: PARAGRAPH,
    showIf: (answers) => answers.q19 === "Yes" || answers.q19 === "Not sure",
  },
  {
    id: "q20",
    title:
      "Paste 2–3 short samples of how you write to customers (emails or replies), so your teammates sound like you.",
    type: "paragraph",
    required: false,
    description: "Optional. Please remove customer names and contact details.",
    maxLength: PARAGRAPH,
  },
  {
    id: "q21",
    title: "How would you like to launch?",
    type: "choice",
    required: true,
    options: [LAUNCH_IN_PERSON, LAUNCH_VIRTUAL],
    maxLength: SHORT,
  },
  {
    id: "q22",
    title: "Which video platform?",
    type: "choice",
    required: true,
    options: ["Zoom", "Microsoft Teams"],
    maxLength: SHORT,
    showIf: (answers) => answers.q21 === LAUNCH_VIRTUAL,
  },
  {
    id: "q23",
    title: "Which days and times usually work best for you in the next 10 days? (Eastern Time)",
    type: "paragraph",
    required: false,
    description:
      "Just a general idea. If you haven't booked yet, pick your exact time with the booking link in your welcome email.",
    maxLength: PARAGRAPH,
  },
  {
    id: "q24",
    title: "Did you have a $99 Technology Strategy Call with us?",
    type: "choice",
    required: true,
    options: ["Yes", "No"],
    maxLength: SHORT,
  },
  {
    id: "q24b",
    title: "If yes, about what date?",
    type: "date",
    required: false,
    maxLength: 10,
    showIf: (answers) => answers.q24 === "Yes",
  },
  {
    id: "q25",
    title: "Anything else we should know?",
    type: "paragraph",
    required: false,
    maxLength: PARAGRAPH,
  },
];

const QUESTION_BY_ID = new Map(INTAKE_QUESTIONS.map((question) => [question.id, question]));

export interface IntakeSection {
  id: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  title: string;
  questionIds: readonly string[];
}

export const INTAKE_SECTIONS: readonly IntakeSection[] = [
  { id: "A", title: "You and your business", questionIds: ["q0", "q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"] },
  { id: "B", title: "Where your time goes", questionIds: ["q9", "q10", "q11"] },
  { id: "C", title: "Your tools", questionIds: ["q12", "q13", "q14", "q15", "q16", "q17", "q17a"] },
  { id: "D", title: "Guardrails", questionIds: ["q18", "q19", "q19b", "q20"] },
  { id: "E", title: "Your launch", questionIds: ["q21"] },
  { id: "F", title: "Virtual launch", questionIds: ["q22"] },
  { id: "G", title: "Almost done", questionIds: ["q23", "q24", "q24b", "q25"] },
];

export function clientReferenceFor(purchase: { id: string; createdAt: Date }): string {
  const year = purchase.createdAt.getUTCFullYear();
  const suffix = purchase.id.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase() || "000000";
  return `ATL-${year}-${suffix}`;
}

export function questionVisible(question: IntakeQuestion, answers: IntakeAnswers): boolean {
  return question.showIf ? question.showIf(answers) : true;
}

export function visibleSections(answers: IntakeAnswers): IntakeSection[] {
  return INTAKE_SECTIONS.filter((section) => section.id !== "F" || answers.q21 === LAUNCH_VIRTUAL);
}

export function sectionQuestions(section: IntakeSection, answers: IntakeAnswers): IntakeQuestion[] {
  return section.questionIds
    .map((id) => QUESTION_BY_ID.get(id))
    .filter((question): question is IntakeQuestion => Boolean(question && questionVisible(question, answers)));
}

export function asIntakeAnswers(value: unknown): IntakeAnswers {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const answers: IntakeAnswers = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === "string") answers[key] = raw;
    else if (Array.isArray(raw) && raw.every((item) => typeof item === "string")) {
      answers[key] = raw as string[];
    }
  }
  return answers;
}

export interface IntakeReview {
  answers: IntakeAnswers;
  errors: Record<string, string>;
}

export function reviewIntake(input: {
  answers: unknown;
  mode: "draft" | "section" | "submit";
  sectionId?: string;
  clientReference: string;
  buyerEmail: string | null;
}): IntakeReview {
  const source = asIntakeAnswers(input.answers);
  const answers: IntakeAnswers = {};
  const errors: Record<string, string> = {};
  const lockedEmail = input.buyerEmail?.trim() || "";

  for (const question of INTAKE_QUESTIONS) {
    if (!questionVisible(question, { ...source, ...answers, q0: input.clientReference, ...(lockedEmail ? { q3: lockedEmail } : {}) })) {
      continue;
    }

    const otherKey = `${question.id}Other`;
    let value = question.readOnly ? input.clientReference : source[question.id];
    if (question.id === "q3" && lockedEmail) value = lockedEmail;
    if (question.id === "q0") value = input.clientReference;

    if (question.type === "checkboxes") {
      const selected = normalizeChecks(value, question);
      const otherText = cleanText(typeof source[otherKey] === "string" ? source[otherKey] : "", false, 120);
      if (selected.length > (question.maxChoices ?? selected.length)) {
        errors[question.id] = "Please pick up to 3.";
      }
      const secret = secretError(selected.join(" ") + " " + otherText);
      if (secret) errors[question.id] = secret;
      if (selected.length > 0) answers[question.id] = selected;
      if (question.allowOther && selected.includes("Other") && otherText) {
        const otherSecret = secretError(otherText);
        if (otherSecret) errors[otherKey] = otherSecret;
        else answers[otherKey] = otherText;
      }
      continue;
    }

    const text = cleanText(typeof value === "string" ? value : "", question.type === "paragraph", question.maxLength);
    const otherText = question.allowOther
      ? cleanText(typeof source[otherKey] === "string" ? source[otherKey] : "", false, 120)
      : "";

    if (text && text.length > question.maxLength) {
      errors[question.id] = `Please keep this under ${question.maxLength} characters.`;
    }

    const secret = secretError(text) || (otherText ? secretError(otherText) : null);
    if (secret) errors[question.id] = secret;

    if (question.type === "email" && text && !validateEmail(text)) {
      errors[question.id] = "Please enter a valid email.";
    }
    if (question.type === "phone" && text && !validatePhone(text)) {
      errors[question.id] = "Please enter a valid phone number.";
    }
    if (question.type === "date" && text && !isIsoDate(text)) {
      errors[question.id] = "Enter a date with the year.";
    }
    if ((question.type === "choice") && text) {
      const allowed = new Set(question.options ?? []);
      if (question.allowOther) allowed.add("Other");
      if (!allowed.has(text)) errors[question.id] = "Choose one of the options.";
    }

    if (text) answers[question.id] = text;
    if (question.allowOther && text === "Other" && otherText && !secretError(otherText)) {
      answers[otherKey] = otherText;
    }
  }

  const requireIds = new Set<string>();
  if (input.mode === "submit") {
    for (const question of INTAKE_QUESTIONS) {
      if (question.required && questionVisible(question, answers)) requireIds.add(question.id);
    }
  } else if (input.mode === "section" && input.sectionId) {
    const section = INTAKE_SECTIONS.find((item) => item.id === input.sectionId);
    if (section) {
      for (const question of sectionQuestions(section, answers)) {
        if (question.required) requireIds.add(question.id);
      }
    }
  }

  for (const id of requireIds) {
    const value = answers[id];
    if (typeof value !== "string" || !value.trim()) {
      errors[id] = errors[id] || "This question is required.";
    }
  }

  return { answers, errors };
}

export function platformFromAnswers(answers: IntakeAnswers): LaunchSetupPlatform | null {
  if (answers.q21 === LAUNCH_IN_PERSON) return "In person (Woodstock, GA area)";
  if (answers.q21 !== LAUNCH_VIRTUAL) return null;
  if (answers.q22 === "Zoom") return "Zoom";
  if (answers.q22 === "Microsoft Teams") return "Microsoft Teams";
  return null;
}

export function bookingFieldsFromIntake(answers: IntakeAnswers): {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany: string;
  notes: string | null;
  platformPref: LaunchSetupPlatform | null;
} {
  return {
    customerName: textAnswer(answers, "q2"),
    customerEmail: textAnswer(answers, "q3"),
    customerPhone: textAnswer(answers, "q4"),
    customerCompany: textAnswer(answers, "q1") || "Not provided",
    notes: textAnswer(answers, "q25") || null,
    platformPref: platformFromAnswers(answers),
  };
}

export function labeledIntakeLines(value: unknown): { label: string; value: string }[] {
  const answers = asIntakeAnswers(value);
  const lines: { label: string; value: string }[] = [];
  for (const question of INTAKE_QUESTIONS) {
    if (!questionVisible(question, answers)) continue;
    const rendered = displayAnswer(question, answers);
    if (!rendered) continue;
    lines.push({ label: question.title, value: rendered });
  }
  return lines;
}

export function labeledIntakeRecord(
  answers: IntakeAnswers,
  extra: Record<string, string>
): Record<string, string> {
  const record: Record<string, string> = {};
  for (const [label, value] of Object.entries(extra)) {
    if (value.trim()) record[label] = value.trim();
  }
  for (const line of labeledIntakeLines(answers)) {
    record[line.label] = line.value;
  }
  return record;
}

function displayAnswer(question: IntakeQuestion, answers: IntakeAnswers): string {
  const value = answers[question.id];
  const other = textAnswer(answers, `${question.id}Other`);
  if (Array.isArray(value)) {
    return value
      .map((option) => (option === "Other" && other ? `Other: ${other}` : option))
      .join(" · ");
  }
  if (typeof value !== "string" || !value.trim()) return "";
  if (value === "Other" && other) return `Other: ${other}`;
  return value.trim();
}

function textAnswer(answers: IntakeAnswers, id: string): string {
  const value = answers[id];
  return typeof value === "string" ? value.trim() : "";
}

function normalizeChecks(value: IntakeValue | undefined, question: IntakeQuestion): string[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set(question.options ?? []);
  if (question.allowOther) allowed.add("Other");
  const selected: string[] = [];
  for (const option of value) {
    const cleaned = cleanText(option, false, question.maxLength);
    if (!allowed.has(cleaned) || selected.includes(cleaned)) continue;
    selected.push(cleaned);
  }
  return selected;
}

function cleanText(value: string, multiline: boolean, maxLength: number): string {
  const stripped = stripHtmlAndScripts(value).replace(/\u0000/g, "");
  const cleaned = multiline
    ? stripped.replace(/\r\n/g, "\n").replace(/[^\S\n]+/g, " ").trim()
    : stripped.replace(/\s+/g, " ").trim();
  return cleaned.slice(0, maxLength + 1);
}

function secretError(value: string): string | null {
  if (!value) return null;
  if (containsCardNumber(value)) return "Please don't enter card numbers.";
  if (containsSecret(value)) return "Please don't enter passwords or keys.";
  return null;
}

function containsCardNumber(value: string): boolean {
  const chunks = value.match(/\d[\d -]{11,30}\d/g) || [];
  return chunks.some((chunk) => {
    const digits = chunk.replace(/\D/g, "");
    return digits.length >= 13 && digits.length <= 19;
  });
}

function containsSecret(value: string): boolean {
  if (/\b(password|passcode|api[_ -]?key|secret key|private key|access token)\b\s*[:=]/i.test(value)) {
    return true;
  }
  if (/\b(sk|rk)_(live|test)_[A-Za-z0-9]+/.test(value)) return true;
  if (/\bwhsec_[A-Za-z0-9]+/.test(value)) return true;
  if (/\bAKIA[0-9A-Z]{16}\b/.test(value)) return true;
  if (/\bgh[pousr]_[A-Za-z0-9]{20,}/.test(value)) return true;
  if (/\bxox[baprs]-[A-Za-z0-9-]{10,}/.test(value)) return true;
  return false;
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1990 || year > 2100) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
