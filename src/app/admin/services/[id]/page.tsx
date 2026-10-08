import { redirect, notFound } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import Link from "next/link";
import ServiceForm from "@/components/ServiceForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const email = await getAdminSession();

  if (!email) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const service = await prisma.service.findUnique({
    where: { id },
  });

  if (!service || service.deletedAt) {
    notFound();
  }

  const initialData = {
    id: service.id,
    title: service.title,
    slug: service.slug || "",
    shortDesc: service.shortDesc,
    description: service.description || service.longDesc,
    outcome: service.outcome || "",
    priceLabel: service.priceLabel,
    price: service.price?.toString() || "",
    priceNote: service.priceNote || "",
    badgeText: service.badgeText || "",
    featured: service.featured,
    ctaLabel: service.ctaLabel,
    ctaUrl: service.ctaUrl,
    sortOrder: service.sortOrder.toString(),
    published: service.published,
    seoTitle: service.seoTitle || "",
    seoDescription: service.seoDescription || "",
  };

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
                href="/admin/services"
                className="text-gray-600 hover:text-gray-900"
              >
                Services
              </Link>
              <span className="text-gray-400">→</span>
              <span className="text-gray-600">Edit Service</span>
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
            Edit Service
          </h2>
          <p className="text-gray-600">
            Update service content and publishing status
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <ServiceForm mode="edit" initialData={initialData} />
        </div>
      </div>
    </div>
  );
}
