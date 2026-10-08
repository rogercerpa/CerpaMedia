import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const email = await getAdminSession();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { path, title, description, ogImageUrl } = await request.json();

    const seoMeta = await prisma.seoMeta.upsert({
      where: { path },
      update: {
        title: title || null,
        description: description || null,
        ogImageUrl: ogImageUrl || null,
      },
      create: {
        path,
        title: title || null,
        description: description || null,
        ogImageUrl: ogImageUrl || null,
      },
    });

    return NextResponse.json(seoMeta);
  } catch (error) {
    console.error("Failed to save SEO metadata:", error);
    return NextResponse.json(
      { error: "Failed to save SEO metadata" },
      { status: 500 }
    );
  }
}
