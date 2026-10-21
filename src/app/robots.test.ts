import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import robots from "./robots";

describe("private launch scheduling", () => {
  it("disallows /launch in robots.txt", () => {
    const rules = robots().rules;
    const list = Array.isArray(rules) ? rules : [rules];
    const disallows = list.flatMap((rule) => {
      const value = rule.disallow ?? [];
      return Array.isArray(value) ? value : [value];
    });
    expect(disallows).toContain("/launch");
  });

  it("leaves the setup page out of the sitemap and the public nav", () => {
    const root = process.cwd();
    const sitemap = readFileSync(path.join(root, "src/app/sitemap.ts"), "utf8");
    const nav = readFileSync(path.join(root, "src/components/Navigation.tsx"), "utf8");
    const footer = readFileSync(path.join(root, "src/components/Footer.tsx"), "utf8");
    expect(sitemap).not.toContain("/launch");
    expect(nav).not.toContain("/launch");
    expect(footer).not.toContain("/launch");
  });
});
