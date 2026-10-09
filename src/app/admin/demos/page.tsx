import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteFlags } from "@/lib/flags";
import { getUsageForToday } from "@/lib/demo";
import AdminChrome from "@/components/admin/AdminChrome";

export const dynamic = "force-dynamic";

export default async function AdminDemosPage() {
  const actor = await getAdminActor();
  if (!actor) redirect("/admin/login");
  const [demos, flags, usage] = await Promise.all([
    prisma.demo.findMany({
      orderBy: { title: "asc" },
      include: { samples: true },
    }),
    getSiteFlags(),
    getUsageForToday(),
  ]);

  return (
    <AdminChrome email={actor.email} role={actor.role} crumbs={[{ label: "Demos" }]}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Demos</h2>
        <p className="text-gray-600">
          Kill switch {flags.demoKillSwitch ? "ON" : "off"} · cap ${flags.demoDailySpendCapUsd}/day ·
          today ${usage.spendUsd.toFixed(3)} · {usage.generationCount} generations
        </p>
      </div>
      <div className="grid gap-4">
        {demos.map((demo) => (
          <Link
            key={demo.id}
            href={`/admin/demos/${demo.id}`}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-900">{demo.title}</h3>
            <p className="text-sm text-gray-500 font-mono">{demo.slug}</p>
            <p className="text-sm text-gray-600 mt-2">
              {demo.samples.length} samples ·{" "}
              {demo.samples.filter((sample) => sample.cachedOutput).length} generated
            </p>
          </Link>
        ))}
        {demos.length === 0 ? (
          <p className="text-gray-500">No demos yet. Apply the Phase 0 SQL seed.</p>
        ) : null}
      </div>
    </AdminChrome>
  );
}
