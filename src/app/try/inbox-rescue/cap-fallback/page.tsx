import DemoPlayer from "@/components/DemoPlayer";
import { getPublicDemoPayload } from "@/lib/demo";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CapFallbackPreviewPage() {
  const payload = await getPublicDemoPayload("inbox-rescue");
  if (!payload) notFound();

  return (
    <div className="bg-bg py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-wide text-text-muted mb-3">
          Cap-hit fallback preview
        </p>
        <DemoPlayer
          {...payload}
          mode="replay"
          samples={[]}
          capHit
          killSwitch={false}
        />
      </div>
    </div>
  );
}
