import { notFound } from "next/navigation";
import { getPublicDemoPayload } from "@/lib/demo";
import DemoPlayer from "@/components/DemoPlayer";
import { incrementAnalyticsEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export default async function PublicDemoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const payload = await getPublicDemoPayload(slug);
  if (!payload) notFound();
  try {
    await incrementAnalyticsEvent("demo_run");
  } catch {
    // Counts are best-effort and must never break the public demo.
  }

  return (
    <div className="bg-bg py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-wide text-text-muted mb-3">
          Try it · preview
        </p>
        <DemoPlayer {...payload} />
      </div>
    </div>
  );
}
