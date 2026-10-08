import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import Link from "next/link";
import FaqList from "./FaqList";
import { prisma } from "@/lib/prisma";

export default async function FaqsPage() {
  const email = await getAdminSession();

  if (!email) {
    redirect("/admin/login");
  }

  const faqs = await prisma.faqItem.findMany({
    where: { deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-bold text-gray-900">FAQs</h1>
            </div>
            <span className="text-sm text-gray-600">{email}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Manage FAQ items for the home page. Only published FAQs appear on the public site.
            </p>
            <Link
              href="/admin/faqs/new"
              className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
            >
              Add FAQ
            </Link>
          </div>
        </div>

        <FaqList faqs={faqs} />
      </div>
    </div>
  );
}
