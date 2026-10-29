import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { getInsightStrategyCallCopy } from "@/lib/get-insight-strategy-call";
import InsightStrategyCallEditor from "./Editor";

export const dynamic = "force-dynamic";

export default async function InsightStrategyCallPage() {
  const email = await getAdminSession();

  if (!email) {
    redirect("/admin/login");
  }

  const copy = await getInsightStrategyCallCopy();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Insights Strategy Call</h1>
            </div>
            <span className="text-sm text-gray-600">{email}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">
            This box appears once, after the body of every Insights article. Write for business
            owners and their teams. Don&apos;t say small business or SMB, and don&apos;t add a street
            address. There is one $99 button, and it books the existing Strategy Call.
          </p>
        </div>
        <InsightStrategyCallEditor initial={copy} />
      </div>
    </div>
  );
}
