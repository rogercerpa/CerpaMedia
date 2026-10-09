import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminChrome from "@/components/admin/AdminChrome";
import StatusBadge from "@/components/admin/StatusBadge";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminGuidesPage() {
  const actor = await getAdminActor();
  if (!actor) redirect("/admin/login");

  const guides = await prisma.guide.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { sections: true } } },
  });

  return (
    <AdminChrome email={actor.email} role={actor.role} crumbs={[{ label: "Guides" }]}>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Guides</h2>
          <p className="text-gray-600">Draft → In review → Approved → Published</p>
        </div>
        <Link
          href="/admin/guides/new"
          className="bg-gray-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-800"
        >
          + New Guide
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sections</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {guides.map((guide) => (
              <tr key={guide.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{guide.title}</div>
                  <div className="text-sm text-gray-500 font-mono">{guide.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={guide.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{guide._count.sections}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {format(guide.updatedAt, "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  <Link href={`/admin/guides/${guide.id}`} className="text-gray-900 hover:text-gray-700">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {guides.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No guides yet.</p>
        ) : null}
      </div>
    </AdminChrome>
  );
}
