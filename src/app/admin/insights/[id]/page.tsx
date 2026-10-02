import { redirect, notFound } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import Link from "next/link";
import InsightForm from "@/components/InsightForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditInsightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const email = await getAdminSession();

  if (!email) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const post = await prisma.insightPost.findUnique({
    where: { id },
  });

  if (!post) {
    notFound();
  }

  const initialData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    body: post.body,
    tags: post.tags.join(", "),
    status: post.status as "draft" | "published",
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
                href="/admin/insights"
                className="text-gray-600 hover:text-gray-900"
              >
                Insights
              </Link>
              <span className="text-gray-400">→</span>
              <span className="text-gray-600">Edit Post</span>
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
            Edit Insight Post
          </h2>
          <p className="text-gray-600">
            Update post content, tags, and publishing status
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <InsightForm mode="edit" initialData={initialData} />
        </div>
      </div>
    </div>
  );
}
