import { notFound, redirect } from "next/navigation";
import { getAdminActor } from "@/lib/auth";
import { getAdminDemoPayload } from "@/lib/demo";
import AdminChrome from "@/components/admin/AdminChrome";
import DemoPlayer from "@/components/DemoPlayer";

export const dynamic = "force-dynamic";

export default async function AdminDemoFallbackPreviewPage() {
  const actor = await getAdminActor();
  if (!actor) redirect("/admin/login");

  const payload = await getAdminDemoPayload("inbox-rescue", {
    forceReplay: true,
  });
  if (!payload) notFound();

  return (
    <AdminChrome
      email={actor.email}
      role={actor.role}
      crumbs={[
        { href: "/admin/demos", label: "Demos" },
        { label: "Cap-hit fallback preview" },
      ]}
    >
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
            Cap-hit fallback preview
          </p>
          <h2 className="text-2xl font-bold text-gray-900">
            Replay-only fallback
          </h2>
          <p className="text-gray-600">
            This is what visitors would see when the daily cap is hit. It is
            admin-only until demos are Published and the public flag is on.
          </p>
        </div>
        <DemoPlayer
          {...payload}
          mode="replay"
          samples={[]}
          capHit
          killSwitch={false}
        />
      </div>
    </AdminChrome>
  );
}
