import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { getAdminActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminChrome from "@/components/admin/AdminChrome";
import StatusBadge from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminTimelinePage() {
  const actor = await getAdminActor();
  if (!actor) redirect("/admin/login");
  const entries = await prisma.timelineEntry.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <AdminChrome email={actor.email} role={actor.role} crumbs={[{ label: "Timeline" }]}>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Timeline entries</h2>
          <p className="text-gray-600">Feeds /future, guide strips, and the later day picker.</p>
        </div>
        <Link
          href="/admin/timeline/new"
          className="bg-gray-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-800"
        >
          + New Entry
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timeframe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{entry.title}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{entry.timeframe}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={entry.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {format(entry.updatedAt, "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  <Link href={`/admin/timeline/${entry.id}`} className="text-gray-900">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No timeline entries yet.</p>
        ) : null}
      </div>
    </AdminChrome>
  );
}
