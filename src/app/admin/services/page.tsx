import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import Link from "next/link";
import ServicesListClient from "./ServicesListClient";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const email = await getAdminSession();

  if (!email) {
    redirect("/admin/login");
  }

  const services = await prisma.service.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

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
              <span className="text-gray-600">Services</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{email}</span>
              <AdminLogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Services Management</h2>
            <p className="text-gray-600">
              {services.length} service{services.length !== 1 ? "s" : ""} in the database
            </p>
          </div>
          <Link
            href="/admin/services/new"
            className="bg-gray-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            + New Service
          </Link>
        </div>

        <ServicesListClient services={services} />

        {services.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">
              No services found. Run the seed script to populate services.
            </p>
            <code className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm">
              npm run db:seed
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
