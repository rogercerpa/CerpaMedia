import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const email = await getAdminSession();

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Find the original service
    const original = await prisma.service.findUnique({
      where: { id },
    });

    if (!original) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Create a duplicate with a new slug
    const newSlug = `${original.slug || original.title.toLowerCase()}-copy-${Date.now()}`;
    const newService = await prisma.service.create({
      data: {
        title: `${original.title} (Copy)`,
        slug: newSlug,
        shortDesc: original.shortDesc,
        longDesc: original.longDesc,
        description: original.description,
        outcome: original.outcome,
        priceLabel: original.priceLabel,
        price: original.price,
        priceNote: original.priceNote,
        badgeText: original.badgeText,
        featured: false, // Don't duplicate featured status
        features: original.features,
        ctaLabel: original.ctaLabel,
        ctaUrl: original.ctaUrl,
        sortOrder: original.sortOrder + 1,
        published: false, // Create as draft
        seoTitle: original.seoTitle,
        seoDescription: original.seoDescription,
      },
    });

    revalidatePath("/services");

    return NextResponse.json({ service: newService }, { status: 201 });
  } catch (error) {
    console.error("Error duplicating service:", error);
    return NextResponse.json(
      { error: "Failed to duplicate service" },
      { status: 500 }
    );
  }
}
