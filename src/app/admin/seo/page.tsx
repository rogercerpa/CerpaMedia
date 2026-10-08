import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import Link from "next/link";
import SeoMetaEditor from "./SeoMetaEditor";
import { prisma } from "@/lib/prisma";

const PUBLIC_PAGES = [
  { path: "/", label: "Home" },
  { path: "/services", label: "Services" },
  { path: "/consult", label: "Consult / Strategy Call" },
  { path: "/services/ai-teammate-launch", label: "AI Teammate Launch" },
  { path: "/insights", label: "Insights (index)" },
  { path: "/contact", label: "Contact" },
  { path: "/privacy", label: "Privacy Policy" },
  { path: "/terms", label: "Terms of Service" },
  { path: "/strategy-call-policy", label: "Strategy Call Policy" },
];

export default async function SeoPage() {
  const email = await getAdminSession();

  if (!email) {
    redirect("/admin/login");
  }

  const seoMeta = await prisma.seoMeta.findMany({
    where: {
      path: {
        in: PUBLIC_PAGES.map((p) => p.path),
      },
    },
  });

  const seoMetaMap = Object.fromEntries(
    seoMeta.map((meta) => [meta.path, meta])
  );

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
              <h1 className="text-xl font-bold text-gray-900">SEO Metadata</h1>
            </div>
            <span className="text-sm text-gray-600">{email}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <p className="text-sm text-gray-600 mb-2">
            Edit SEO metadata for all public pages. Changes appear immediately in page metadata.
          </p>
          <p className="text-xs text-gray-500">
            Character limits: Title ~60, Description ~155. Insights post pages use their own per-post metadata.
          </p>
        </div>

        <SeoMetaEditor pages={PUBLIC_PAGES} seoMetaMap={seoMetaMap} />
      </div>
    </div>
  );
}
