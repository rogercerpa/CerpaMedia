/**
 * Reword stored positioning that calls the reader a small business or SMB.
 *
 * Dry-run (default). Prints each before/after. Writes nothing:
 *   npx tsx scripts/reword-small-business.ts
 *
 * Apply only after review, and only against a Neon backup branch.
 * Do not point this at production.
 *   REWORD_CONFIRM=backup-branch-ready npx tsx scripts/reword-small-business.ts --apply
 *
 * Existing slugs and URLs are never modified. A second run is a no-op once
 * the sentences are already rewritten.
 */
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import {
  HERO_SUBHEADLINE,
  INSIGHT_PLANS,
  SEO_DESCRIPTION,
  SEO_PATHS,
  SEO_TITLE,
  applySwaps,
  findFraming,
  retag,
  unhandledFraming,
  type SwapChange,
} from "../src/lib/reword-small-business";

dotenv.config({ path: ".env.local" });
dotenv.config();

const apply = process.argv.includes("--apply");
const confirmed = process.env.REWORD_CONFIRM === "backup-branch-ready";

type Leftover = {
  where: string;
  match: string;
  reason: string | null;
  excerpt: string;
};

function excerpt(text: string, index: number, match: string): string {
  const start = Math.max(0, index - 40);
  const end = Math.min(text.length, index + match.length + 40);
  return text.slice(start, end).replace(/\s+/g, " ");
}

function printChanges(changes: SwapChange[]) {
  for (const change of changes) {
    const times = change.count > 1 ? ` (x${change.count})` : "";
    console.log(`  before${times}: ${change.from}`);
    console.log(`  after${times}:  ${change.to}`);
    console.log("");
  }
}

function collectHits(where: string, text: string, into: Leftover[]) {
  for (const hit of findFraming(text)) {
    into.push({
      where,
      match: hit.match,
      reason: hit.reason,
      excerpt: excerpt(text, hit.index, hit.match),
    });
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Dry-run needs a read-only connection. Nothing was written.");
    process.exit(1);
  }

  if (apply && !confirmed) {
    console.error(
      "Refusing to write. Review the dry-run, create a Neon backup branch, point DATABASE_URL at that branch, then re-run with REWORD_CONFIRM=backup-branch-ready --apply."
    );
    process.exit(1);
  }

  console.log(apply ? "APPLY mode. Writing reworded fields." : "DRY-RUN. No rows will be written.");
  console.log("");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const leftovers: Leftover[] = [];
  let changeCount = 0;
  let missingCount = 0;

  try {
    const plansBySlug = new Map(INSIGHT_PLANS.map((plan) => [plan.slug, plan]));
    const posts = await prisma.insightPost.findMany({
      select: { id: true, slug: true, title: true, summary: true, body: true, tags: true },
      orderBy: { slug: "asc" },
    });

    for (const post of posts) {
      const plan = plansBySlug.get(post.slug);
      console.log(`InsightPost ${post.slug} (${post.id})`);

      if (findFraming(post.slug).length > 0) {
        leftovers.push({
          where: `InsightPost.slug ${post.slug}`,
          match: post.slug,
          reason: "existing slug left unchanged so the URL stays the same",
          excerpt: post.slug,
        });
        console.log("  slug left unchanged (existing URL)");
      }

      if (!plan) {
        const live = [post.title, post.summary, post.body, post.tags.join(", ")].join("\n");
        const hits = unhandledFraming(live);
        if (hits.length === 0 && findFraming(live).length === 0) {
          console.log("  no size-framing copy");
        } else {
          console.log("  UNHANDLED. No sentence plan for this post. Not modified.");
          collectHits(`InsightPost ${post.slug} (no plan)`, live, leftovers);
          missingCount += hits.length;
        }
        console.log("");
        continue;
      }

      const title = applySwaps(post.title, plan.title);
      const summary = applySwaps(post.summary, plan.summary);
      const body = applySwaps(post.body, plan.body);
      const tags = retag(post.tags, plan.tags);
      const changes = [...title.changes, ...summary.changes, ...body.changes, ...tags.changes];
      const missing = [...title.missing, ...summary.missing, ...body.missing];

      if (changes.length === 0 && missing.length === 0) {
        console.log("  unchanged (already reworded)");
      } else {
        printChanges(changes);
        for (const item of missing) {
          console.log(`  MISSING (copy diverged or already edited; not guessed): ${item}`);
          console.log("");
        }
      }

      changeCount += changes.length;
      missingCount += missing.length;

      const projected = [title.text, summary.text, body.text, tags.tags.join("\n")].join("\n");
      collectHits(`InsightPost ${post.slug} projected`, projected, leftovers);

      const tagHits = tags.tags.flatMap((tag) =>
        unhandledFraming(tag).map((hit) => ({ tag, hit }))
      );
      for (const item of tagHits) {
        leftovers.push({
          where: `InsightPost.tags ${post.slug}`,
          match: item.hit.match,
          reason: null,
          excerpt: item.tag,
        });
      }

      if (apply && changes.length > 0) {
        await prisma.insightPost.update({
          where: { id: post.id },
          data: {
            title: title.text,
            summary: summary.text,
            body: body.text,
            tags: tags.tags,
          },
        });
        console.log("  wrote title, summary, body, and tags. slug unchanged.");
      }
      console.log("");
    }

    for (const plan of INSIGHT_PLANS) {
      if (!posts.some((post) => post.slug === plan.slug)) {
        console.log(`InsightPost ${plan.slug}`);
        console.log("  not in this database. skipped.");
        console.log("");
      }
    }

    const seoRows = await prisma.seoMeta.findMany({
      select: { id: true, path: true, title: true, description: true },
      orderBy: { path: "asc" },
    });
    const plannedPaths = new Set<string>(SEO_PATHS);

    for (const row of seoRows) {
      console.log(`SeoMeta ${row.path} (${row.id})`);
      const title = row.title ?? "";
      const description = row.description ?? "";

      if (!plannedPaths.has(row.path)) {
        const live = `${title}\n${description}`;
        if (unhandledFraming(live).length > 0) {
          console.log("  UNHANDLED path. Not modified.");
          collectHits(`SeoMeta ${row.path}`, live, leftovers);
          missingCount += unhandledFraming(live).length;
        } else {
          console.log("  no size-framing copy");
        }
        console.log("");
        continue;
      }

      const titleResult = applySwaps(title, [SEO_TITLE]);
      const descriptionResult = applySwaps(description, [SEO_DESCRIPTION]);
      const changes = [...titleResult.changes, ...descriptionResult.changes];
      const missing = [...titleResult.missing, ...descriptionResult.missing];
      if (changes.length === 0 && missing.length === 0) {
        console.log("  unchanged (already reworded or field empty)");
      } else {
        printChanges(changes);
        for (const item of missing) {
          console.log(`  MISSING (copy diverged; not guessed): ${item}`);
          console.log("");
        }
      }
      changeCount += changes.length;
      missingCount += missing.length;
      collectHits(
        `SeoMeta ${row.path} projected`,
        `${titleResult.text}\n${descriptionResult.text}`,
        leftovers
      );

      if (apply && changes.length > 0) {
        await prisma.seoMeta.update({
          where: { id: row.id },
          data: {
            title: titleResult.text || null,
            description: descriptionResult.text || null,
          },
        });
        console.log("  wrote title and description.");
      }
      console.log("");
    }

    const hero = await prisma.siteContent.findUnique({ where: { key: "home-hero" } });
    console.log("SiteContent home-hero");
    if (!hero || !hero.value || typeof hero.value !== "object" || Array.isArray(hero.value)) {
      console.log("  missing or not an object. skipped.");
    } else {
      const value = hero.value as Record<string, unknown>;
      const subheadline = typeof value.subheadline === "string" ? value.subheadline : "";
      const result = applySwaps(subheadline, [HERO_SUBHEADLINE]);
      if (result.changes.length === 0 && result.missing.length === 0) {
        console.log("  unchanged (already reworded or field empty)");
      } else {
        printChanges(result.changes);
        for (const item of result.missing) {
          console.log(`  MISSING (copy diverged; not guessed): ${item}`);
          console.log("");
        }
      }
      changeCount += result.changes.length;
      missingCount += result.missing.length;
      collectHits("SiteContent home-hero projected", result.text, leftovers);

      if (apply && result.changes.length > 0) {
        await prisma.siteContent.update({
          where: { id: hero.id },
          data: { value: { ...value, subheadline: result.text } },
        });
        console.log("  wrote subheadline. other hero fields unchanged.");
      }
    }
    console.log("");

    const services = await prisma.service.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        shortDesc: true,
        longDesc: true,
        description: true,
        features: true,
        outcome: true,
        badgeText: true,
        priceNote: true,
        seoTitle: true,
        seoDescription: true,
      },
    });
    console.log(`Service rows scanned: ${services.length}`);
    for (const service of services) {
      const live = [
        service.title,
        service.shortDesc,
        service.longDesc,
        service.description ?? "",
        service.features.join("\n"),
        service.outcome ?? "",
        service.badgeText ?? "",
        service.priceNote ?? "",
        service.seoTitle ?? "",
        service.seoDescription ?? "",
      ].join("\n");
      const hits = unhandledFraming(live);
      if (hits.length > 0) {
        console.log(`  UNHANDLED ${service.slug ?? service.id}. Not modified.`);
        collectHits(`Service ${service.slug ?? service.id}`, live, leftovers);
        missingCount += hits.length;
      }
    }
    if (services.every((service) => {
      const live = [
        service.title,
        service.shortDesc,
        service.longDesc,
        service.description ?? "",
        service.features.join("\n"),
        service.outcome ?? "",
        service.badgeText ?? "",
        service.priceNote ?? "",
        service.seoTitle ?? "",
        service.seoDescription ?? "",
      ].join("\n");
      return unhandledFraming(live).length === 0;
    })) {
      console.log("  no size-framing copy in service offers");
    }
    console.log("");

    const faqs = await prisma.faqItem.findMany({ select: { id: true, question: true, answer: true } });
    const testimonials = await prisma.testimonial.findMany({
      select: { id: true, quote: true, role: true },
    });
    const guides = await prisma.guide.findMany({
      select: { id: true, slug: true, title: true, summaryBox: true, rogerNote: true, seoTitle: true, seoDescription: true },
    });
    for (const faq of faqs) {
      const live = `${faq.question}\n${faq.answer}`;
      if (unhandledFraming(live).length > 0) {
        collectHits(`FaqItem ${faq.id}`, live, leftovers);
        missingCount += unhandledFraming(live).length;
        console.log(`FaqItem ${faq.id} UNHANDLED. Not modified.`);
      }
    }
    for (const item of testimonials) {
      const live = `${item.role}\n${item.quote}`;
      if (unhandledFraming(live).length > 0) {
        collectHits(`Testimonial ${item.id}`, live, leftovers);
        missingCount += unhandledFraming(live).length;
        console.log(`Testimonial ${item.id} UNHANDLED. Not modified.`);
      }
    }
    for (const guide of guides) {
      const live = [guide.title, guide.summaryBox, guide.rogerNote ?? "", guide.seoTitle ?? "", guide.seoDescription ?? ""].join("\n");
      if (unhandledFraming(live).length > 0) {
        collectHits(`Guide ${guide.slug}`, live, leftovers);
        missingCount += unhandledFraming(live).length;
        console.log(`Guide ${guide.slug} UNHANDLED. Not modified.`);
      }
    }

    const unhandled = leftovers.filter((item) => item.reason === null);
    const left = leftovers.filter((item) => item.reason !== null);

    console.log("=== Left on purpose after this rewrite ===");
    if (left.length === 0) console.log("(none)");
    for (const item of left) {
      console.log(`- ${item.where}`);
      console.log(`  match: ${item.match}`);
      console.log(`  why: ${item.reason}`);
      console.log(`  excerpt: ${item.excerpt}`);
    }
    console.log("");
    console.log("=== Still positioning (not written, needs a sentence rewrite) ===");
    if (unhandled.length === 0) console.log("(none)");
    for (const item of unhandled) {
      console.log(`- ${item.where}`);
      console.log(`  match: ${item.match}`);
      console.log(`  excerpt: ${item.excerpt}`);
    }
    console.log("");
    console.log(
      `${apply ? "Applied" : "Would apply"} ${changeCount} replacement${changeCount === 1 ? "" : "s"}. Missing sentences: ${missingCount}.`
    );
    if (!apply) console.log("Dry-run only. No rows were written.");

    if (missingCount > 0 || unhandled.length > 0) process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
