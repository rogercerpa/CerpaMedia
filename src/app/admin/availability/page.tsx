import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import Link from "next/link";
import DateAvailabilityManager from "@/components/DateAvailabilityManager";

export default async function AdminAvailabilityPage() {
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
              <span className="text-gray-600">Availability</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{email}</span>
              <AdminLogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Availability Management
          </h2>
          <p className="text-gray-600">
            Set specific dates and hours when you're available for consultations (America/New_York timezone).
          </p>
          <p className="text-sm text-gray-500 mt-2">
            <strong>Important:</strong> Only dates you add here will show slots to customers. No default availability.
          </p>
        </div>

        <DateAvailabilityManager />
      </div>
    </div>
  );
}
