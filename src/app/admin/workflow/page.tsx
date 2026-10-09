import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminChrome from "@/components/admin/AdminChrome";
import StatusBadge from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

export default async function WorkflowPage() {
  const actor = await getAdminActor();
  if (!actor) redirect("/admin/login");

  const [guides, timeline, demos] = await Promise.all([
    prisma.guide.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.timelineEntry.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.demo.findMany({ orderBy: { updatedAt: "desc" } }),
  ]);

  const rows = [
    ...guides.map((item) => ({
      id: item.id,
      type: "Guide",
      title: item.title,
      status: item.status,
      href: `/admin/guides/${item.id}`,
    })),
    ...timeline.map((item) => ({
      id: item.id,
      type: "Timeline",
      title: item.title,
      status: item.status,
      href: `/admin/timeline/${item.id}`,
    })),
    ...demos.map((item) => ({
      id: item.id,
      type: "Demo",
      title: item.title,
      status: item.status,
      href: `/admin/demos/${item.id}`,
    })),
  ];

  return (
    <AdminChrome email={actor.email} role={actor.role} crumbs={[{ label: "Workflow" }]}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Publishing workflow</h2>
        <p className="text-gray-600">
          Draft → In review → Approved → Published. Only Roger&apos;s owner role can publish.
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((row) => (
              <tr key={`${row.type}-${row.id}`}>
                <td className="px-6 py-4 text-sm text-gray-500">{row.type}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.title}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  <Link href={row.href} className="text-gray-900">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="p-8 text-center text-gray-500">Nothing in the workflow yet.</p>
        ) : null}
      </div>
    </AdminChrome>
  );
}
