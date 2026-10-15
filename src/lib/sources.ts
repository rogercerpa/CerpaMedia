import { prisma } from "./prisma";

export const SOURCE_TARGET = {
  guide: "guide",
  guide_section: "guide_section",
  timeline: "timeline",
} as const;

export type SourceTargetType =
  (typeof SOURCE_TARGET)[keyof typeof SOURCE_TARGET];

export async function replaceSourceLinks(args: {
  targetType: SourceTargetType;
  targetId: string;
  sourceIds: string[];
}): Promise<void> {
  const uniqueIds = Array.from(new Set(args.sourceIds.filter(Boolean)));

  await prisma.sourceLink.deleteMany({
    where: {
      targetType: args.targetType,
      targetId: args.targetId,
    },
  });

  if (uniqueIds.length === 0) {
    return;
  }

  await prisma.sourceLink.createMany({
    data: uniqueIds.map((sourceId) => ({
      sourceId,
      targetType: args.targetType,
      targetId: args.targetId,
    })),
    skipDuplicates: true,
  });
}

export async function linkedSourcesFor(
  targetType: SourceTargetType,
  targetId: string
): Promise<{ id: string; status: string }[]> {
  const links = await prisma.sourceLink.findMany({
    where: { targetType, targetId },
    include: { source: { select: { id: true, status: true } } },
  });
  return links.map((link) => ({
    id: link.source.id,
    status: link.source.status,
  }));
}

export async function linkedSourcesForGuide(guideId: string): Promise<
  { id: string; status: string }[]
> {
  const sections = await prisma.guideSection.findMany({
    where: { guideId },
    select: { id: true },
  });
  const sectionIds = sections.map((section) => section.id);

  const links = await prisma.sourceLink.findMany({
    where: {
      OR: [
        { targetType: SOURCE_TARGET.guide, targetId: guideId },
        ...(sectionIds.length
          ? [
              {
                targetType: SOURCE_TARGET.guide_section,
                targetId: { in: sectionIds },
              },
            ]
          : []),
      ],
    },
    include: { source: { select: { id: true, status: true } } },
  });

  const byId = new Map<string, { id: string; status: string }>();
  for (const link of links) {
    byId.set(link.source.id, {
      id: link.source.id,
      status: link.source.status,
    });
  }
  return Array.from(byId.values());
}
