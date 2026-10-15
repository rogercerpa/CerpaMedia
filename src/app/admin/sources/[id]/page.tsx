import { notFound, redirect } from "next/navigation";
import { getAdminActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminChrome from "@/components/admin/AdminChrome";
import SourceForm from "@/components/admin/SourceForm";
import type { SourceStatus } from "@/lib/publishing";

export const dynamic = "force-dynamic";

export default async function EditSourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await getAdminActor();
  if (!actor) redirect("/admin/login");
  const { id } = await params;
  const source = await prisma.source.findUnique({ where: { id } });
  if (!source) notFound();

  return (
    <AdminChrome
      email={actor.email}
      role={actor.role}
      crumbs={[
        { href: "/admin/sources", label: "Sources" },
        { label: "Edit" },
      ]}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Source</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <SourceForm
          mode="edit"
          initialData={{
            id: source.id,
            title: source.title,
            publisher: source.publisher,
            publishedDate: source.publishedDate ?? "",
            url: source.url,
            exactClaim: source.exactClaim ?? "",
            notes: source.notes ?? "",
            status: source.status as SourceStatus,
            nextReviewAt: source.nextReviewAt
              ? source.nextReviewAt.toISOString().slice(0, 10)
              : "",
          }}
        />
      </div>
    </AdminChrome>
  );
}
