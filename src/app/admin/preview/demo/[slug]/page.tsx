import { notFound, redirect } from "next/navigation";
import { getAdminActor } from "@/lib/auth";
import { getAdminDemoPayload } from "@/lib/demo";
import AdminChrome from "@/components/admin/AdminChrome";
import DemoPlayer from "@/components/DemoPlayer";

export const dynamic = "force-dynamic";

export default async function AdminDemoPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const actor = await getAdminActor();
  if (!actor) redirect("/admin/login");

  const { slug } = await params;
  const payload = await getAdminDemoPayload(slug);
  if (!payload) notFound();

  return (
    <AdminChrome
      email={actor.email}
      role={actor.role}
      crumbs={[
        { href: "/admin/demos", label: "Demos" },
        { label: "Demo preview" },
      ]}
    >
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
            Admin preview · not public
          </p>
          <h2 className="text-2xl font-bold text-gray-900">
            {payload.title} preview
          </h2>
          <p className="text-gray-600">
            Visitors cannot see this until the demo is Published and{" "}
            <span className="font-mono text-sm">demosPublicEnabled</span> is on.
          </p>
        </div>
        <DemoPlayer {...payload} />
      </div>
    </AdminChrome>
  );
}
