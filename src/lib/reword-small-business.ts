/**
 * Sentence-level rewrites for stored "small business" / SMB positioning.
 * The CLI in scripts/reword-small-business.ts applies these after a Neon
 * backup branch. Slugs and existing URLs are never rewritten.
 */

import { INSIGHT_SLUG_ALIASES } from "./insight-slug-aliases";

export type TextSwap = {
  from: string;
  to: string;
};

export type InsightPlan = {
  /** Existing public URL segment. Never updated. */
  slug: string;
  title: TextSwap[];
  summary: TextSwap[];
  body: TextSwap[];
  tags: Record<string, string>;
};

export const FRAMING_PATTERN =
  /small[\s-]business(?:es)?|\bsmbs?\b|small teams?|small shops?|small employers|small sales|solo leads|solo or teams(?: of(?:\s+\d+[–-]\d+)?)?|\b1[–-]4\b|\btiny\b/gi;

/** Official names and cited titles. Positioning around them is rewritten; these stay. */
export const ALLOWED_PHRASES = [
  "Small Businesses, Bigger Capabilities",
  "Small Business Development Centers",
  "Small Business & Entrepreneurship Council",
  "Helping small businesses put AI to work",
  "Introducing Muse for small business",
  "expanding its AI agent Muse to small businesses",
  "Meta Muse AI for small business",
  "AI on Main Street",
];

export const SEO_PATHS = ["/", "/services", "/consult", "/insights", "/contact"] as const;

export const SEO_TITLE: TextSwap = {
  from: "CerpaMedia - Technology Services for Small Business",
  to: "CerpaMedia - Technology Services for Business Owners",
};

export const SEO_DESCRIPTION: TextSwap = {
  from: "Strategic web development, AI integration, and automation consulting for small businesses. Expert guidance to help your business operate more efficiently.",
  to: "Web development, AI integration, and automation consulting for business owners. A clear plan, practical tools, and systems that run with less friction.",
};

export const HERO_SUBHEADLINE: TextSwap = {
  from: "CerpaMedia helps small businesses get practical web apps, AI, and automation — with a clear plan first, fixed scope when you build, and you own the accounts and code.",
  to: "CerpaMedia helps business owners get practical web apps, AI, and automation — with a clear plan first, fixed scope when you build, and you own the accounts and code.",
};

const museTitle: TextSwap = {
  from: "Meta's Muse agent now plugs into the tools small businesses already run",
  to: "Meta's Muse agent now plugs into the tools owners already run",
};

const teamBotsTitle: TextSwap = {
  from: "Team Bots: Shared Grok Bot Coworkers for Small Business Teams",
  to: "Team Bots: Shared Grok Bot Coworkers for Owner-Led Teams",
};

const reportTitle: TextSwap = {
  from: "OpenAI's SMB Report: Small Teams Are Handing Work to Agents",
  to: "OpenAI's New Report: Owner-Led Teams Are Handing Work to Agents",
};

const compareTitle: TextSwap = {
  from: "Dots vs. Grok Bot vs. Muse: Which AI Teammate Buys Your Small Business the Most Hours Back",
  to: "Dots vs. Grok Bot vs. Muse: Which AI Teammate Buys Your Business the Most Hours Back",
};

const adoptionTitle: TextSwap = {
  from: "Most small businesses now use AI. The ones growing fastest use it every week.",
  to: "Most owners in this month's surveys now use AI. The ones growing fastest use it every week.",
};

const seedTitle: TextSwap = {
  from: "AI Automation for Small Businesses: What's Actually Working in 2026",
  to: "AI Automation for Owner-Led Businesses: What's Actually Working in 2026",
};

export const INSIGHT_PLANS: InsightPlan[] = [
  {
    slug: "meta-muse-business-tools",
    title: [museTitle],
    summary: [
      {
        from: "Meta expanded Muse for U.S. and Canada SMBs on Sep 29, 2026 — connectors to Shopify, QuickBooks, Slack, Stripe, and more, with owner approval before publish, send, or spend. Free tier plus $20/$100 plans.",
        to: "Meta expanded Muse for businesses in the U.S. and Canada on Sep 29, 2026 — connectors to Shopify, QuickBooks, Slack, Stripe, and more, with owner approval before publish, send, or spend. Free tier plus $20/$100 plans.",
      },
    ],
    body: [
      museTitle,
      {
        from: "On September 29, 2026, Meta expanded its Muse AI agent for small businesses in the U.S. and Canada.",
        to: "On September 29, 2026, Meta expanded its Muse AI agent for businesses in the U.S. and Canada.",
      },
      {
        from: "The move follows Meta's Enterprise Platform push the day before and puts a consumer-grade agent squarely into day-to-day SMB operations.",
        to: "The move follows Meta's Enterprise Platform push the day before and puts a consumer-grade agent squarely into day-to-day operations.",
      },
    ],
    tags: { "small-business": "owner-led" },
  },
  {
    slug: "grok-team-bots-shared-ai-coworkers",
    title: [teamBotsTitle],
    summary: [
      {
        from: "For SMBs, that means one AI coworker for sales, support, marketing, or ops instead of fragmented personal chats.",
        to: "For owner-led teams, that means one AI coworker for sales, support, marketing, or ops instead of fragmented personal chats.",
      },
    ],
    body: [
      teamBotsTitle,
      {
        from: "On the same launch post, Harper's CEO (SMB insurance) said a Team Bot automated multi-platform lapsed-policy recovery in 24 hours and saved customers over $120,000.",
        to: "On the same launch post, Harper's CEO (business insurance) said a Team Bot automated multi-platform lapsed-policy recovery in 24 hours and saved customers over $120,000.",
      },
      {
        from: "Owners and operators of small sales, CS, marketing, and ops teams who need one shared \"source of truth\" AI, not five private chat histories.",
        to: "Owners and operators of sales, customer-success, marketing, and ops teams who need one shared \"source of truth\" AI, not five private chat histories.",
      },
      {
        from: "CerpaMedia helps SMBs adopt tools like Grok Bot without turning them into another unmanaged inbox.",
        to: "CerpaMedia helps business owners adopt tools like Grok Bot without turning them into another unmanaged inbox.",
      },
    ],
    tags: { "SMB automation": "team automation" },
  },
  {
    slug: "openai-dots-always-on-agents",
    title: [],
    summary: [
      {
        from: "For SMBs on Pro / Business Premium / Enterprise, the win is background progress with approval gates—not unattended autopilot.",
        to: "For owners on Pro / Business Premium / Enterprise, the win is background progress with approval gates—not unattended autopilot.",
      },
    ],
    body: [
      {
        from: "SMB owners and managers already on ChatGPT Pro or Business Premium who want background follow-through on decks, FAQs, research, and drafts—not another blank chat box.",
        to: "Owners and managers already on ChatGPT Pro or Business Premium who want background follow-through on decks, FAQs, research, and drafts—not another blank chat box.",
      },
    ],
    tags: { "SMB productivity": "operations" },
  },
  {
    slug: "openai-agentic-shift-sbdc-report",
    title: [reportTitle],
    summary: [
      {
        from: "The report says agentic tools like ChatGPT Work and Codex now drive about two-thirds of small-business output tokens—and that finance, supply chain, compliance, and marketing are where small teams lean hardest on agents.",
        to: "The report says agentic tools like ChatGPT Work and Codex now drive about two-thirds of the output tokens it measured for those firms—and that finance, supply chain, compliance, and marketing are where those teams lean hardest on agents.",
      },
    ],
    body: [
      reportTitle,
      {
        from: "run hands-on workshops across participating networks (goal: reach at least 1,000 small businesses in person)",
        to: "run hands-on workshops across participating networks (OpenAI's stated goal: reach at least 1,000 businesses in person)",
      },
      {
        from: "In August, agentic output tokens from products like ChatGPT Work and Codex made up about two-thirds of all small-business output tokens, up from about one-third in April 2026. In OpenAI's sample, finance and accounting, supply chain, legal and compliance, and marketing each accounted for at least three times as large a share of small-business users' agent interactions as they did for larger-business users—areas where a small team often needs help without a dedicated specialist on staff.",
        to: "In August, agentic output tokens from products like ChatGPT Work and Codex made up about two-thirds of the output tokens OpenAI measured for the firms in this report, up from about one-third in April 2026. In OpenAI's sample, finance and accounting, supply chain, legal and compliance, and marketing each accounted for at least three times as large a share of those firms' agent interactions as they did for larger firms—areas where a team often needs help without a dedicated specialist on staff.",
      },
      {
        from: "Owners and managers at firms under ~500 people who already dabble in ChatGPT but haven't picked one owned agent workflow.",
        to: "Owners and managers who already dabble in ChatGPT but haven't picked one owned agent workflow. The report's numbers come from firms of about 500 people or fewer.",
      },
      {
        from: "Advisors and tech-services firms coaching SMBs through AI adoption who need a credible \"why now\" narrative plus a responsible rollout plan.",
        to: "Advisors and tech-services firms coaching owner-led businesses through AI adoption who need a credible \"why now\" narrative plus a responsible rollout plan.",
      },
      {
        from: "CerpaMedia helps small businesses turn \"we should use AI\" into one owned workflow with approval gates.",
        to: "CerpaMedia helps business owners turn \"we should use AI\" into one owned workflow with approval gates.",
      },
    ],
    tags: { SMB: "AI adoption" },
  },
  {
    slug: "dots-vs-grok-bot-vs-muse-ai-teammate",
    title: [compareTitle],
    summary: [
      {
        from: "Here's how they actually differ, which SMB job each one fits, and how to run a safe two-week pilot before you commit.",
        to: "Here's how they actually differ, which job each one fits, and how to run a safe two-week pilot before you commit.",
      },
    ],
    body: [
      compareTitle,
      {
        from: "**Meta Muse: an owner's agent wired into the SMB stack**",
        to: "**Meta Muse: an owner's agent wired into the tools you already run**",
      },
      {
        from: "On September 29, 2026, Meta expanded Muse for U.S. and Canada small businesses.",
        to: "On September 29, 2026, Meta expanded Muse for businesses in the U.S. and Canada.",
      },
      {
        from: "Meta stack plus SMB connectors (Shopify, QuickBooks, Stripe, ads)",
        to: "Meta stack plus business connectors (Shopify, QuickBooks, Stripe, ads)",
      },
      {
        from: "**Best-fit SMB job**",
        to: "**Best-fit job**",
      },
      {
        from: "like a Woodstock boutique on Shopify running Meta ads or an Atlanta service shop juggling QuickBooks and Stripe, who need the business triaged before they can justify a hire.",
        to: "like a Woodstock shop on Shopify running Meta ads or an Atlanta service business juggling QuickBooks and Stripe, who need the business triaged before they can justify a hire.",
      },
      {
        from: "**Small sales, support, marketing, and ops teams** already living in Slack",
        to: "**Sales, support, marketing, and ops teams** already living in Slack",
      },
      {
        from: "**Managers and solo leads already paying for ChatGPT**",
        to: "**Managers and individual leads already paying for ChatGPT**",
      },
      {
        from: "[Team Bots: Shared Grok Bot Coworkers for Small Business Teams](https://cerpamedia.com/insights/grok-team-bots-shared-ai-coworkers-smb)",
        to: "[Team Bots: Shared Grok Bot Coworkers for Owner-Led Teams](https://cerpamedia.com/insights/grok-team-bots-shared-ai-coworkers)",
      },
      {
        from: "[Meta's Muse agent now plugs into the tools small businesses already run](https://cerpamedia.com/insights/meta-muse-small-business-tools)",
        to: "[Meta's Muse agent now plugs into the tools owners already run](https://cerpamedia.com/insights/meta-muse-business-tools)",
      },
    ],
    tags: { SMB: "owner-led" },
  },
  {
    slug: "business-ai-adoption-october-2026",
    title: [adoptionTitle],
    summary: [
      {
        from: "Three new surveys this month say AI agents are now normal on Main Street, and that the gap isn't who has tried AI, it's who uses it regularly. Here's what the numbers mean for a small team and how to start with one job.",
        to: "Three new surveys this month say AI agents are now a normal part of the work, and that the gap isn't who has tried AI, it's who uses it regularly. Here's what the numbers mean for a busy owner and how to start with one job.",
      },
    ],
    body: [
      {
        from: "found 58% of small employers use AI agents regularly or occasionally, and another 14% are considering or planning to.",
        to: "found 58% of the employers in the survey use AI agents regularly or occasionally, and another 14% are considering or planning to.",
      },
      {
        from: "PYMNTS Intelligence's SMB Growth Monitor (533 U.S. SMBs, August 2026)",
        to: "PYMNTS Intelligence's August growth monitor (533 U.S. businesses, August 2026)",
      },
      {
        from: "Owners running lean.",
        to: "Busy owners.",
      },
      {
        from: "the jobs small businesses usually pay staff or outside help to do.",
        to: "the jobs owners usually pay staff or outside help to do.",
      },
      {
        from: "[https://sbecouncil.org/2026/10/08/new-small-business-check-up-survey-main-street-businesses-are-powering-through-2026/](https://sbecouncil.org/2026/10/08/new-small-business-check-up-survey-main-street-businesses-are-powering-through-2026/)",
        to: "[October Check Up survey](https://sbecouncil.org/2026/10/08/new-small-business-check-up-survey-main-street-businesses-are-powering-through-2026/)",
      },
      {
        from: "[https://www.pymnts.com/study_posts/ai-goes-to-work-how-smbs-grow-without-growing-payroll/](https://www.pymnts.com/study_posts/ai-goes-to-work-how-smbs-grow-without-growing-payroll/)",
        to: "[AI goes to work](https://www.pymnts.com/study_posts/ai-goes-to-work-how-smbs-grow-without-growing-payroll/)",
      },
      {
        from: "[https://heartlandforward.org/heartland-small-businesses-match-the-nation-on-ai-adoption-as-owners-say-ai-boosts-their-bottom-line/](https://heartlandforward.org/heartland-small-businesses-match-the-nation-on-ai-adoption-as-owners-say-ai-boosts-their-bottom-line/)",
        to: "[AI adoption survey](https://heartlandforward.org/heartland-small-businesses-match-the-nation-on-ai-adoption-as-owners-say-ai-boosts-their-bottom-line/)",
      },
    ],
    tags: { "small business": "owner-led" },
  },
  {
    slug: "openai-gpt-4o-gpt-4-1-api-shutdown",
    title: [],
    summary: [],
    body: [
      {
        from: "Three details matter for a small business:",
        to: "Three details matter if you run the business:",
      },
      {
        from: "OpenAI mentions dedicated capacity through its sales team, but most small businesses should aim to be done well before the holidays.",
        to: "OpenAI mentions dedicated capacity through its sales team, but most owners should aim to be done well before the holidays.",
      },
    ],
    tags: { SMB: "operations" },
  },
  {
    slug: "ai-automation-for-small-businesses-2026",
    title: [seedTitle],
    summary: [
      {
        from: "Practical insights on AI tools that small businesses are using today to save time and reduce costs — without the hype.",
        to: "Practical insights on AI tools owner-led businesses are using today to save time and reduce costs — without the hype.",
      },
    ],
    body: [
      seedTitle,
      {
        from: "Small businesses are finding real value in AI automation — but not where most people think.",
        to: "Owner-led businesses are finding real value in AI automation — but not where most people think.",
      },
      {
        from: "We help small businesses identify where automation makes sense and implement practical solutions that deliver ROI.",
        to: "We help business owners identify where automation makes sense and implement practical solutions that deliver ROI.",
      },
      {
        from: "The technology is mature, affordable, and ready for small businesses that want to work smarter.",
        to: "The technology is mature, affordable, and ready for owners who want to work smarter.",
      },
    ],
    tags: { SMB: "operations" },
  },
];

export type SwapChange = {
  from: string;
  to: string;
  count: number;
};

export type SwapResult = {
  text: string;
  changes: SwapChange[];
  missing: string[];
};

function flexSource(literal: string): string {
  return literal
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/'/g, "[\\u0027\\u2019]")
    .replace(/"/g, "[\\u0022\\u201C\\u201D]");
}

export function flexIncludes(haystack: string, needle: string): boolean {
  return new RegExp(flexSource(needle)).test(haystack);
}

export function applySwaps(input: string, swaps: TextSwap[]): SwapResult {
  let text = input;
  const changes: SwapChange[] = [];
  const missing: string[] = [];

  for (const swap of swaps) {
    const re = new RegExp(flexSource(swap.from), "g");
    const matches = text.match(re);
    if (!matches) {
      if (!flexIncludes(text, swap.to)) missing.push(swap.from);
      continue;
    }
    text = text.replace(re, () => swap.to);
    changes.push({ from: swap.from, to: swap.to, count: matches.length });
  }

  return { text, changes, missing };
}

export function retag(
  tags: string[],
  map: Record<string, string>
): { tags: string[]; changes: SwapChange[] } {
  const changes: SwapChange[] = [];
  const next = tags.map((tag) => {
    const replacement = map[tag];
    if (!replacement || replacement === tag) return tag;
    changes.push({ from: tag, to: replacement, count: 1 });
    return replacement;
  });

  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const tag of next) {
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(tag);
  }

  return { tags: deduped, changes };
}

export type FramingHit = {
  match: string;
  index: number;
  reason: string | null;
};

export function isInsideUrl(text: string, index: number): boolean {
  const start = text.lastIndexOf("http", index);
  if (start === -1 || index - start > 400) return false;
  return !/\s/.test(text.slice(start, index));
}

export function allowedReason(text: string, index: number, match: string): string | null {
  if (isInsideUrl(text, index)) return "existing URL left unchanged";

  const lower = text.toLowerCase();
  const needle = match.toLowerCase();
  for (const phrase of ALLOWED_PHRASES) {
    const phraseLower = phrase.toLowerCase();
    if (!phraseLower.includes(needle)) continue;
    let from = 0;
    while (from < lower.length) {
      const at = lower.indexOf(phraseLower, from);
      if (at === -1) break;
      if (index >= at && index + match.length <= at + phrase.length) {
        return `proper name or cited title left unchanged: ${phrase}`;
      }
      from = at + phraseLower.length;
    }
  }

  return null;
}

export function findFraming(text: string): FramingHit[] {
  const hits: FramingHit[] = [];
  const re = new RegExp(FRAMING_PATTERN.source, FRAMING_PATTERN.flags);
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    hits.push({
      match: match[0],
      index: match.index,
      reason: allowedReason(text, match.index, match[0]),
    });
    if (match.index === re.lastIndex) re.lastIndex += 1;
  }
  return hits;
}

export function unhandledFraming(text: string): FramingHit[] {
  return findFraming(text).filter((hit) => hit.reason === null);
}

/**
 * Public pages use these so visitors see the reword before the database
 * script runs. They are idempotent: once the stored text is updated, the
 * same input comes back unchanged. Admin screens keep the stored text.
 */
export function presentHeroSubheadline(subheadline: string): string {
  return applySwaps(subheadline, [HERO_SUBHEADLINE]).text;
}

export function presentSeoText(value: string, swap: TextSwap): string {
  return applySwaps(value, [swap]).text;
}

export function presentInsight<T extends {
  slug: string;
  title: string;
  summary: string;
  body?: string;
  tags: string[];
}>(post: T): T {
  // Match plan by new slug or by old slug (if post still has old slug in DB)
  let plan = INSIGHT_PLANS.find((item) => item.slug === post.slug);
  
  // Fallback: if post has old slug, try to find plan by new slug
  if (!plan) {
    const newSlug = INSIGHT_SLUG_ALIASES[post.slug];
    if (newSlug) {
      plan = INSIGHT_PLANS.find((item) => item.slug === newSlug);
    }
  }
  
  if (!plan) return post;

  const next: T = {
    ...post,
    title: applySwaps(post.title, plan.title).text,
    summary: applySwaps(post.summary, plan.summary).text,
    tags: retag(post.tags, plan.tags).tags,
  };

  if (post.body !== undefined) {
    next.body = applySwaps(post.body, plan.body).text;
  }

  return next;
}
