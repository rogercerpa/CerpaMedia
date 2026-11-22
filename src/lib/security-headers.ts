/**
 * Static security headers for every route.
 *
 * A per-request nonce cannot live in `headers()`: Next.js only applies a
 * nonce when the policy is generated during the request, and that forces
 * every page to render dynamically. Production HTML from this app includes
 * Next.js inline flight scripts (`self.__next_f`), so a static policy needs
 * `'unsafe-inline'` on script-src. Style *elements* are served from
 * `/_next/static/css`. `'unsafe-inline'` is still required on style-src:
 * `next/image` sets `style="color:transparent"`, insight tables pass GFM
 * `textAlign` through, the launch intake progress bar sets a width, and
 * Next.js's production error page injects a `<style>` element. Blocking
 * that element makes the error page throw.
 *
 * Stripe Checkout is a top-level redirect to checkout.stripe.com or
 * buy.stripe.com. The browser does not load Stripe.js. Vercel Web Analytics,
 * when the admin flag is on, loads `/_vercel/insights/script.js` (same origin)
 * and beacons vitals.vercel-insights.com. Speed Insights is not installed.
 */

export type SecurityHeader = {
  key: string;
  value: string;
};

const PERMISSIONS_POLICY = [
  "accelerometer=()",
  "camera=()",
  "geolocation=()",
  "gyroscope=()",
  "magnetometer=()",
  "microphone=()",
  "payment=()",
  "usb=()",
  "browsing-topics=()",
  "interest-cohort=()",
].join(", ");

export function contentSecurityPolicy(nodeEnv: string | undefined = process.env.NODE_ENV): string {
  const isDev = nodeEnv === "development";
  const scriptSrc = ["'self'", "'unsafe-inline'", "https://va.vercel-scripts.com"];
  if (isDev) {
    scriptSrc.push("'unsafe-eval'");
  }

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];

  if (!isDev) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

export function securityHeaders(nodeEnv: string | undefined = process.env.NODE_ENV): SecurityHeader[] {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(nodeEnv) },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains",
    },
  ];
}
