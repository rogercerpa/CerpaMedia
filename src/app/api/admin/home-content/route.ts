import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { resolveHeroContent } from "@/lib/hero-content";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  const email = await getAdminSession();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { hero, howItWorks } = await request.json();

    if (!hero || typeof hero !== "object" || Array.isArray(hero)) {
      return NextResponse.json({ error: "Hero content is required" }, { status: 400 });
    }

    const storedHero = resolveHeroContent(hero) as unknown as Prisma.InputJsonValue;

    await prisma.siteContent.upsert({
      where: { key: "home-hero" },
      update: { value: storedHero },
      create: { key: "home-hero", value: storedHero },
    });

    await prisma.siteContent.upsert({
      where: { key: "home-how-it-works" },
      update: { value: howItWorks },
      create: { key: "home-how-it-works", value: howItWorks },
    });

    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save home content:", error);
    return NextResponse.json(
      { error: "Failed to save content" },
      { status: 500 }
    );
  }
}
