import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import FaqForm from "../FaqForm";

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const email = await getAdminSession();

  if (!email) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const faq = await prisma.faqItem.findUnique({
    where: { id },
  });

  if (!faq) {
    redirect("/admin/faqs");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/faqs"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to FAQs
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Edit FAQ</h1>
            </div>
            <span className="text-sm text-gray-600">{email}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FaqForm faq={faq} />
      </div>
    </div>
  );
}
