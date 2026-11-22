import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config";
import { contentSecurityPolicy, securityHeaders } from "../security-headers";

describe("security headers", () => {
  it("sets the required headers and hides the Next.js powered-by header", async () => {
    expect(nextConfig.poweredByHeader).toBe(false);

    const groups = await nextConfig.headers?.();
    const allRoutes = groups?.find((group) => group.source === "/(.*)");
    const headerMap = Object.fromEntries(
      (allRoutes?.headers ?? []).map((header) => [header.key, header.value])
    );

    expect(headerMap["Content-Security-Policy"]).toBe(contentSecurityPolicy("test"));
    expect(headerMap["X-Frame-Options"]).toBe("DENY");
    expect(headerMap["X-Content-Type-Options"]).toBe("nosniff");
    expect(headerMap["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headerMap["Permissions-Policy"]).toContain("camera=()");
    expect(headerMap["Permissions-Policy"]).toContain("microphone=()");
    expect(headerMap["Permissions-Policy"]).toContain("geolocation=()");
    expect(headerMap["Strict-Transport-Security"]).toBe(
      "max-age=63072000; includeSubDomains"
    );
    expect(headerMap["Strict-Transport-Security"]).not.toContain("preload");

    const launch = groups?.find((group) => group.source === "/launch/:path*");
    expect(launch?.headers).toEqual(
      expect.arrayContaining([
        { key: "X-Robots-Tag", value: "noindex, nofollow" },
        { key: "Cache-Control", value: "private, no-store" },
      ])
    );
  });

  it("allows Next inline scripts and the inline styles the app actually emits", () => {
    const policy = contentSecurityPolicy("production");

    expect(policy).toContain("script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com");
    expect(policy).toContain("style-src 'self' 'unsafe-inline'");
    expect(policy).toContain("font-src 'self'");
    expect(policy).toContain("img-src 'self' data: blob:");
    expect(policy).toContain("https://vitals.vercel-insights.com");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("frame-src 'none'");
    expect(policy).not.toContain("'unsafe-eval'");
    expect(policy).not.toContain("js.stripe.com");
  });

  it("adds unsafe-eval only for the development server", () => {
    expect(securityHeaders("development").find((header) => header.key === "Content-Security-Policy")?.value).toContain(
      "'unsafe-eval'"
    );
  });
});
