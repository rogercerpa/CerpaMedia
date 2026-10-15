import { redirect } from "next/navigation";
import { getAdminActor } from "@/lib/auth";
import AdminChrome from "@/components/admin/AdminChrome";
import SourceForm from "@/components/admin/SourceForm";

export default async function NewSourcePage() {
  const actor = await getAdminActor();
  if (!actor) redirect("/admin/login");
  return (
    <AdminChrome
      email={actor.email}
      role={actor.role}
      crumbs={[
        { href: "/admin/sources", label: "Sources" },
        { label: "New" },
      ]}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Source</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <SourceForm mode="create" />
      </div>
    </AdminChrome>
  );
}
