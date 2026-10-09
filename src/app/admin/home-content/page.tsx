import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import Link from "next/link";
import HomeContentEditor from "./HomeContentEditor";
import { prisma } from "@/lib/prisma";

export default async function HomeContentPage() {
  const email = await getAdminSession();

  if (!email) {
    redirect("/admin/login");
  }

  const heroContent = await prisma.siteContent.findUnique({
    where: { key: "home-hero" },
  });

  const howItWorksContent = await prisma.siteContent.findUnique({
    where: { key: "home-how-it-works" },
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
              <h1 className="text-xl font-bold text-gray-900">
                Home Page Content
              </h1>
            </div>
            <span className="text-sm text-gray-600">{email}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Edit the hero and "How we work" sections on the home page.
            Changes appear immediately on the public site.
          </p>
        </div>

        <HomeContentEditor
          hero={heroContent?.value as any}
          howItWorks={howItWorksContent?.value as any}
        />
      </div>
    </div>
  );
}
