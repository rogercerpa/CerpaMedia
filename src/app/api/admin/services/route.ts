import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const email = await getAdminSession();

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      shortDesc,
      description,
      outcome,
      priceLabel,
      price,
      priceNote,
      badgeText,
      featured,
      features,
      ctaLabel,
      ctaUrl,
      sortOrder,
      published,
      seoTitle,
      seoDescription,
    } = body;

    if (!title || !slug || !shortDesc || !description || !priceLabel || !ctaLabel || !ctaUrl || sortOrder === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.service.findFirst({
      where: { slug, deletedAt: null },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A service with this slug already exists" },
        { status: 400 }
      );
    }

    // Validate features array
    const validFeatures = Array.isArray(features) 
      ? features.filter((f: unknown) => typeof f === "string" && f.trim().length > 0)
      : [];

    const service = await prisma.service.create({
      data: {
        title,
        slug,
        shortDesc,
        longDesc: description, // Use description for longDesc too
        description,
        outcome,
        priceLabel,
        price,
        priceNote,
        badgeText,
        featured: !!featured,
        features: validFeatures,
        ctaLabel,
        ctaUrl,
        sortOrder: parseInt(sortOrder, 10),
        published: !!published,
        seoTitle,
        seoDescription,
      },
    });

    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath(`/services/${slug}`);

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
