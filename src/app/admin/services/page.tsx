import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import Link from "next/link";

export default async function AdminServicesPage() {
  const email = await getAdminSession();

  if (!email) {
    redirect("/admin/login");
  }

  const services = await prisma.service.findMany({
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Services</h2>
            <p className="text-gray-600">
              {services.length} service{services.length !== 1 ? "s" : ""} in the
              database
            </p>
          </div>
          <div className="text-sm bg-primary-100 text-primary-700 px-3 py-1.5 rounded">
            Full CMS editing coming in M2–M4
          </div>
        </div>

        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-600"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {service.title}
                    </h3>
                    {service.published ? (
                      <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Published
                      </span>
                    ) : (
                      <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{service.shortDesc}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-semibold text-primary-600 mb-1">
                    {service.priceLabel}
                  </div>
                  <div className="text-sm text-gray-500">
                    Order: {service.sortOrder}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-4">
                    <span className="text-gray-600">
                      <span className="font-medium">CTA:</span> {service.ctaLabel}
                    </span>
                    <span className="text-gray-600">
                      <span className="font-medium">URL:</span> {service.ctaUrl}
                    </span>
                  </div>
                  <div className="text-gray-500">
                    Updated:{" "}
                    {new Date(service.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

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
