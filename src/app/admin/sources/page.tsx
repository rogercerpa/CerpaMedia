import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { getAdminActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminChrome from "@/components/admin/AdminChrome";
import StatusBadge from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminSourcesPage() {
  const actor = await getAdminActor();
  if (!actor) redirect("/admin/login");
  const sources = await prisma.source.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <AdminChrome email={actor.email} role={actor.role} crumbs={[{ label: "Sources" }]}>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Source library</h2>
          <p className="text-gray-600">
            New rows default to to-verify. Guides and timeline entries cannot publish while a linked source is still to-verify.
          </p>
        </div>
        <Link
          href="/admin/sources/new"
          className="bg-gray-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-800"
        >
          + New Source
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Publisher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sources.map((source) => (
              <tr key={source.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{source.title}</div>
                  <a href={source.url} className="text-xs text-gray-500 break-all" target="_blank">
                    {source.url}
                  </a>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{source.publisher}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{source.publishedDate || "—"}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={source.status} />
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  <Link href={`/admin/sources/${source.id}`} className="text-gray-900">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sources.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No sources yet.</p>
        ) : null}
        <p className="px-6 py-3 text-xs text-gray-400">
          Updated {sources[0] ? format(sources[0].updatedAt, "MMM d, yyyy") : "—"}
        </p>
      </div>
    </AdminChrome>
  );
}
