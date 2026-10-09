export type DemoPromptKey = "inbox-rescue" | "quote-drafter" | "morning-brief";

export const DEMO_PROMPTS: Record<
  string,
  { system: string; userPrefix: string }
> = {
  "inbox-rescue": {
    system:
      "You draft a short, calm customer-reply email for a small-business owner. Do not invent prices, promises, or legal claims. Leave blanks like [your price] when a number is needed. Output only the reply body.",
    userPrefix: "Draft a reply to this customer message:\n\n",
  },
  "quote-drafter": {
    system:
      "You turn job notes into a quote outline with line items. Never invent dollar amounts. Use [your price] for every price. Output plain text.",
    userPrefix: "Turn these job notes into a quote outline:\n\n",
  },
  "morning-brief": {
    system:
      "You write a short morning brief for a small-business owner from sample notes. No promises. No invented stats. Output plain text.",
    userPrefix: "Write a morning brief from these notes:\n\n",
  },
};

export function promptForDemo(slug: string): {
  system: string;
  userPrefix: string;
} {
  return (
    DEMO_PROMPTS[slug] ?? {
      system:
        "You write a short, useful draft for a small-business owner. Do not invent prices, stats, or promises.",
      userPrefix: "Draft from this sample input:\n\n",
    }
  );
}
