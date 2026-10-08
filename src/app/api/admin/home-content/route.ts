import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const email = await getAdminSession();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { hero, howItWorks } = await request.json();

    await prisma.siteContent.upsert({
      where: { key: "home-hero" },
      update: { value: hero },
      create: { key: "home-hero", value: hero },
    });

    await prisma.siteContent.upsert({
      where: { key: "home-how-it-works" },
      update: { value: howItWorks },
      create: { key: "home-how-it-works", value: howItWorks },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save home content:", error);
    return NextResponse.json(
      { error: "Failed to save content" },
      { status: 500 }
    );
  }
}
