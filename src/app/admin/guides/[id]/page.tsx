import { notFound, redirect } from "next/navigation";
import { getAdminActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminChrome from "@/components/admin/AdminChrome";
import GuideForm from "@/components/admin/GuideForm";
import type { PublishStatus } from "@/lib/publishing";

export const dynamic = "force-dynamic";

export default async function EditGuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await getAdminActor();
  if (!actor) redirect("/admin/login");
  const { id } = await params;
  const [guide, sources, links] = await Promise.all([
    prisma.guide.findUnique({
      where: { id },
      include: { sections: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.source.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true, status: true },
    }),
    prisma.sourceLink.findMany({
      where: { targetType: "guide", targetId: id },
      select: { sourceId: true },
    }),
  ]);
  if (!guide) notFound();

  return (
    <AdminChrome
      email={actor.email}
      role={actor.role}
      crumbs={[
        { href: "/admin/guides", label: "Guides" },
        { label: "Edit" },
      ]}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Guide</h2>
      {actor.role !== "owner" ? (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-900 px-4 py-3 text-sm">
          You can draft and send this for review. Publish is blocked for non-owners on the server.
        </div>
      ) : null}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <GuideForm
          mode="edit"
          role={actor.role}
          sources={sources}
          initialData={{
            id: guide.id,
            title: guide.title,
            slug: guide.slug,
            industry: guide.industry,
            summaryBox: guide.summaryBox,
            rogerNote: guide.rogerNote ?? "",
            rogerStory: guide.rogerStory ?? "",
            seoTitle: guide.seoTitle ?? "",
            seoDescription: guide.seoDescription ?? "",
            reviewStamp: guide.reviewStamp ?? "",
            status: guide.status as PublishStatus,
            sourceIds: links.map((link) => link.sourceId),
            sections: guide.sections.map((section) => ({
              title: section.title,
              job: section.job,
              todaySteps: section.todaySteps,
              tryItDemoSlug: section.tryItDemoSlug ?? "",
              whatStaysHuman: section.whatStaysHuman,
              todayText: section.todayText,
              years2to5Text: section.years2to5Text,
              years5to10Text: section.years5to10Text,
            })),
          }}
        />
      </div>
    </AdminChrome>
  );
}
