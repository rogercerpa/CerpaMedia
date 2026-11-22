import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HeroRotator } from "@/components/HeroRotator";
import { DEFAULT_HERO_PAIRS } from "@/lib/hero-content";

describe("HeroRotator server HTML", () => {
  it("renders pair 1 as the only h1 and keeps the other lines in the page", () => {
    const html = renderToStaticMarkup(
      <HeroRotator pairs={DEFAULT_HERO_PAIRS.map((pair) => ({ ...pair }))}>
        <a href="/consult">Book a call</a>
      </HeroRotator>,
    );

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("From idea to working system in days, not months.");
    expect(html).toContain("Reach further, faster.");
    expect(html).toContain('aria-live="off"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('<strong class="text-text">you own the accounts and code.</strong>');
    expect(html).toContain('<a href="/consult">Book a call</a>');

    const firstSlide = html.slice(0, html.indexOf("</h1>"));
    expect(firstSlide).toContain("From idea to working system in days, not months.");
    expect(firstSlide).toContain("opacity-100");
    expect(firstSlide).not.toContain("aria-hidden");
  });
});
