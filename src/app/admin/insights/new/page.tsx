import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import Link from "next/link";
import InsightForm from "@/components/InsightForm";

export default async function NewInsightPage() {
  const email = await getAdminSession();

  if (!email) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link
                href="/admin"
                className="text-xl font-bold text-gray-900 hover:text-gray-700"
              >
                CerpaMedia Admin
              </Link>
              <span className="text-gray-400">→</span>
              <Link
                href="/admin/insights"
                className="text-gray-600 hover:text-gray-900"
              >
                Insights
              </Link>
              <span className="text-gray-400">→</span>
              <span className="text-gray-600">New Post</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{email}</span>
              <AdminLogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Create New Insight Post
          </h2>
          <p className="text-gray-600">
            Draft a new AI/tech insight with SMB business angles
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <InsightForm mode="create" />
        </div>
      </div>
    </div>
  );
}
