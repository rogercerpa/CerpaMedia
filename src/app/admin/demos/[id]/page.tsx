import { notFound, redirect } from "next/navigation";
import { getAdminActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteFlags } from "@/lib/flags";
import { getUsageForToday, parseReplayScript } from "@/lib/demo";
import AdminChrome from "@/components/admin/AdminChrome";
import DemoAdminForm from "@/components/admin/DemoAdminForm";

export const dynamic = "force-dynamic";

export default async function EditDemoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await getAdminActor();
  if (!actor) redirect("/admin/login");
  const { id } = await params;
  const [demo, flags, usage] = await Promise.all([
    prisma.demo.findUnique({
      where: { id },
      include: { samples: { orderBy: { sortOrder: "asc" } } },
    }),
    getSiteFlags(),
    getUsageForToday(),
  ]);
  if (!demo) notFound();

  return (
    <AdminChrome
      email={actor.email}
      role={actor.role}
      crumbs={[
        { href: "/admin/demos", label: "Demos" },
        { label: demo.title },
      ]}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Demo admin</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <DemoAdminForm
          isOwner={actor.role === "owner"}
          role={actor.role}
          flags={flags}
          usage={usage}
          initialData={{
            id: demo.id,
            slug: demo.slug,
            title: demo.title,
            description: demo.description,
            enabled: demo.enabled,
            status: demo.status,
            restingMessage: demo.restingMessage,
            replayScript: parseReplayScript(demo.replayScript),
            samples: demo.samples.map((sample) => ({
              id: sample.id,
              label: sample.label,
              inputText: sample.inputText,
              cachedOutput: sample.cachedOutput ?? "",
              generatedAt: sample.generatedAt?.toISOString() ?? null,
            })),
          }}
        />
      </div>
    </AdminChrome>
  );
}
