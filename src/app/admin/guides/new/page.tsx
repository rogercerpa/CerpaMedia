import { redirect } from "next/navigation";
import { getAdminActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminChrome from "@/components/admin/AdminChrome";
import GuideForm from "@/components/admin/GuideForm";

export const dynamic = "force-dynamic";

export default async function NewGuidePage() {
  const actor = await getAdminActor();
  if (!actor) redirect("/admin/login");
  const sources = await prisma.source.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true, status: true },
  });

  return (
    <AdminChrome
      email={actor.email}
      role={actor.role}
      crumbs={[
        { href: "/admin/guides", label: "Guides" },
        { label: "New" },
      ]}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Guide</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <GuideForm mode="create" role={actor.role} sources={sources} />
      </div>
    </AdminChrome>
  );
}
