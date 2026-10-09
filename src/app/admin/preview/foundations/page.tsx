import { redirect } from "next/navigation";
import { getAdminActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAdminDemoPayload } from "@/lib/demo";
import AdminChrome from "@/components/admin/AdminChrome";
import SignedNote from "@/components/SignedNote";
import ReviewStamp from "@/components/ReviewStamp";
import BuiltByBadge from "@/components/BuiltByBadge";
import DemoPlayer from "@/components/DemoPlayer";
import DraftPrivacySections from "@/components/DraftPrivacySections";

export const dynamic = "force-dynamic";

export default async function FoundationsPreviewPage() {
  const actor = await getAdminActor();
  if (!actor) redirect("/admin/login");

  const demoPayload = await getAdminDemoPayload("inbox-rescue");
  const guide = await prisma.guide.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <AdminChrome
      email={actor.email}
      role={actor.role}
      crumbs={[{ label: "Foundations preview" }]}
    >
      <div className="space-y-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Foundations preview
          </h2>
          <p className="text-gray-600">
            These components are OFF on live pages until Roger turns the CMS flag on.
          </p>
        </div>

        <section className="bg-white border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Roger&apos;s signed note</h3>
          <SignedNote
            text={
              guide?.rogerNote ||
              "I check every guide before it goes live. AI drafts it. I answer for it. If a number is not in a source, it does not go on the page."
            }
          />
        </section>

        <section className="bg-white border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Reviewed by Roger</h3>
          <ReviewStamp
            date={guide?.reviewedAt || new Date()}
            note={guide?.reviewStamp || "Checked the claims and cut anything we could not source."}
          />
        </section>

        <section className="bg-white border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Footer badge</h3>
          <div className="bg-charcoal py-6">
            <BuiltByBadge />
          </div>
        </section>

        <section className="bg-white border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Public demo (replay + samples)</h3>
          {demoPayload ? (
            <DemoPlayer {...demoPayload} />
          ) : (
            <p className="text-sm text-gray-500">
              Inbox Rescue is not seeded yet. Apply docs/phase0-production.sql.
            </p>
          )}
        </section>

        <section className="bg-white border border-gray-200 p-6">
          <DraftPrivacySections />
        </section>
      </div>
    </AdminChrome>
  );
}
