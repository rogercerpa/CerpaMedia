import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { InsightMarkdown } from "@/components/InsightMarkdown";

function renderMarkdown(markdown: string) {
  return renderToStaticMarkup(<InsightMarkdown>{markdown}</InsightMarkdown>);
}

describe("Insight markdown tables", () => {
  it("renders a GFM pipe table as a real table", () => {
    const html = renderMarkdown(
      [
        "## Pricing tiers (as of Nov 17, 2026)",
        "",
        "All individual plans share one AI usage pool.",
        "",
        "| Plan | Price | Includes Grok Bot? |",
        "|---|---|---|",
        "| **Free** | $0 | No |",
        "| **Premium** | $30/mo or $300/yr | Yes |",
        "",
      ].join("\n")
    );

    expect(html).toContain("<table");
    expect(html).toContain("<thead");
    expect(html).toContain("<tbody");
    expect(html).toContain(">Plan<");
    expect(html).toContain(">Price<");
    expect(html).toContain(">Includes Grok Bot?<");
    expect(html).toContain("<strong>Free</strong>");
    expect(html).toContain("<strong>Premium</strong>");
    expect(html).toContain("$0");
    expect(html).toContain("$30/mo or $300/yr");
    expect(html).not.toContain("|---|---|");
    expect(html).not.toContain("| Plan |");
    expect(html.match(/<th\b/g)).toHaveLength(3);
    expect(html.match(/<td\b/g)).toHaveLength(6);

    const wrapper = html.match(
      /<div[^>]*aria-label="Scrollable table"[^>]*>\s*<table[\s\S]*?<\/table>\s*<\/div>/
    );
    expect(wrapper).not.toBeNull();
    expect(wrapper?.[0]).toContain("overflow-x-auto");
    expect(wrapper?.[0]).toContain("max-w-full");
    expect(wrapper?.[0]).toContain("[scrollbar-width:thin]");

    expect(html).toContain("bg-bg-subtle");
    expect(html).toContain("border-border");
    expect(html).toContain("even:bg-bg-subtle");
    expect(html).toContain("font-semibold");
    expect(html).toContain('scope="col"');
    expect(html).toContain("[&amp;_strong]:font-semibold");
    expect(html).toContain("[&amp;_strong]:text-text");
    expect(html).toContain('<h2 class="text-2xl font-semibold text-text mb-3 mt-8 first:mt-0">');
  });

  it("honors column alignment and escaped pipes", () => {
    const html = renderMarkdown(
      [
        "| Left | Center | Right |",
        "| :--- | :---: | ---: |",
        "| plain | mid | end |",
        "| left \\| still | | side |",
        "",
      ].join("\n")
    );

    expect(html.match(/text-align:left/g)).toHaveLength(3);
    expect(html.match(/text-align:center/g)).toHaveLength(3);
    expect(html.match(/text-align:right/g)).toHaveLength(3);
    expect(html).toContain("left | still");
    expect(html).toContain(">side<");
    expect(html.match(/<td\b/g)?.length).toBe(6);
  });

  it("keeps a link inside a cell and does not turn a fenced table into HTML", () => {
    const html = renderMarkdown(
      [
        "| Plan | Notes |",
        "| --- | --- |",
        "| Launch | See the [offer](https://example.com/offer) |",
        "",
        "```",
        "| Plan | Price |",
        "| --- | --- |",
        "| Free | $0 |",
        "```",
        "",
      ].join("\n")
    );

    expect(html.match(/<table\b/g)).toHaveLength(1);
    expect(html).toContain('href="https://example.com/offer"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain(
      'class="text-text underline hover:text-text-muted transition-colors"'
    );
    expect(html).toContain("<pre");
    expect(html).toContain("| Plan | Price |");
    expect(html).toContain("| --- | --- |");
  });
});

describe("Insight markdown existing syntax", () => {
  it("still renders headings, lists, links, bold, and leaves non-table syntax alone", () => {
    const html = renderMarkdown(
      [
        "# Heading one",
        "",
        "## Heading two",
        "",
        "### Heading three",
        "",
        "A paragraph with **bold**, *italic*, and a [docs link](https://example.com/docs).",
        "",
        "- first item",
        "- second item",
        "",
        "1. step one",
        "2. step two",
        "",
        "> a quoted line",
        "",
        "Use a pipe | between words.",
        "",
        "~~not struck~~",
        "",
        "https://example.com/bare-url",
        "",
        "- [ ] task item",
        "",
        "An `inline code` span.",
        "",
        "See [Book a $99 strategy call](/consult) and the [Launch](/services/ai-teammate-launch) page.",
        "",
      ].join("\n")
    );

    expect(html).toContain(
      '<h1 class="text-3xl font-semibold text-text mb-4 mt-8 first:mt-0">Heading one</h1>'
    );
    expect(html).toContain(
      '<h2 class="text-2xl font-semibold text-text mb-3 mt-8 first:mt-0">Heading two</h2>'
    );
    expect(html).toContain(
      '<h3 class="text-xl font-semibold text-text mb-2 mt-6 first:mt-0">Heading three</h3>'
    );
    expect(html).toContain(
      '<p class="text-[15px] text-text-muted leading-relaxed mb-4">A paragraph with <strong>bold</strong>, <em>italic</em>, and a <a href="https://example.com/docs" class="text-text underline hover:text-text-muted transition-colors" target="_blank" rel="noopener noreferrer">docs link</a>.</p>'
    );
    expect(html).toContain(
      '<ul class="list-disc list-inside mb-4 space-y-2 text-[15px] text-text-muted">'
    );
    expect(html).toContain(
      '<li class="text-[15px] text-text-muted leading-relaxed">first item</li>'
    );
    expect(html).toContain(">second item</li>");
    expect(html).toContain(
      '<ol class="list-decimal list-inside mb-4 space-y-2 text-[15px] text-text-muted">'
    );
    expect(html).toContain(">step one</li>");
    expect(html).toContain(">step two</li>");
    expect(html).toContain(
      '<blockquote class="border-l-4 border-border pl-4 italic text-text-muted my-4">'
    );
    expect(html).toContain("a quoted line");
    expect(html).toContain("Use a pipe | between words.");
    expect(html).toContain("~~not struck~~");
    expect(html).not.toContain("<del");
    expect(html).toContain("https://example.com/bare-url");
    expect(html).not.toContain('href="https://example.com/bare-url"');
    expect(html).toContain("[ ] task item");
    expect(html).not.toContain("<input");
    expect(html).toContain(
      '<code class="bg-bg-subtle px-1.5 py-0.5 text-sm text-text font-mono">inline code</code>'
    );
    expect(html).toContain('href="/consult"');
    expect(html).toContain(">book a call</a>");
    expect(html).toContain('data-strategy-call="99"');
    expect(html).toContain('href="/services/ai-teammate-launch"');
    expect(html).toContain(">Launch</a>");
    expect(html).not.toContain("<table");
  });
});
