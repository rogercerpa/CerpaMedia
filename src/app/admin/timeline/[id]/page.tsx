import { notFound, redirect } from "next/navigation";
import { getAdminActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminChrome from "@/components/admin/AdminChrome";
import TimelineForm from "@/components/admin/TimelineForm";
import type { PublishStatus } from "@/lib/publishing";

export const dynamic = "force-dynamic";

export default async function EditTimelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await getAdminActor();
  if (!actor) redirect("/admin/login");
  const { id } = await params;
  const [entry, sources, links] = await Promise.all([
    prisma.timelineEntry.findUnique({ where: { id } }),
    prisma.source.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true, status: true },
    }),
    prisma.sourceLink.findMany({
      where: { targetType: "timeline", targetId: id },
      select: { sourceId: true },
    }),
  ]);
  if (!entry) notFound();

  return (
    <AdminChrome
      email={actor.email}
      role={actor.role}
      crumbs={[
        { href: "/admin/timeline", label: "Timeline" },
        { label: "Edit" },
      ]}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Timeline Entry</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <TimelineForm
          mode="edit"
          role={actor.role}
          sources={sources}
          initialData={{
            id: entry.id,
            timeframe: entry.timeframe,
            industry: entry.industry,
            title: entry.title,
            text: entry.text,
            status: entry.status as PublishStatus,
            sourceIds: links.map((link) => link.sourceId),
          }}
        />
      </div>
    </AdminChrome>
  );
}
