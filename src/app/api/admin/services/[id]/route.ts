import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const email = await getAdminSession();

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
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

    // Check if service exists and is not deleted
    const existing = await prisma.service.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Check if slug is taken by another service
    const slugTaken = await prisma.service.findFirst({
      where: {
        slug,
        deletedAt: null,
        id: { not: id },
      },
    });

    if (slugTaken) {
      return NextResponse.json(
        { error: "A service with this slug already exists" },
        { status: 400 }
      );
    }

    // Validate features array
    const validFeatures = Array.isArray(features) 
      ? features.filter((f: unknown) => typeof f === "string" && f.trim().length > 0)
      : [];

    const service = await prisma.service.update({
      where: { id },
      data: {
        title,
        slug,
        shortDesc,
        longDesc: description,
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
    if (existing.slug !== slug) {
      revalidatePath(`/services/${existing.slug}`);
    }
    revalidatePath(`/services/${slug}`);

    return NextResponse.json({ service });
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const email = await getAdminSession();

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    // Partial update (for publish/unpublish toggle)
    const existing = await prisma.service.findUnique({ where: { id } });
    
    const service = await prisma.service.update({
      where: { id },
      data: body,
    });

    revalidatePath("/");
    revalidatePath("/services");
    if (existing?.slug) {
      revalidatePath(`/services/${existing.slug}`);
    }

    return NextResponse.json({ service });
  } catch (error) {
    console.error("Error patching service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const email = await getAdminSession();

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Get service before deleting to revalidate its slug
    const existing = await prisma.service.findUnique({ where: { id } });

    // Soft delete
    const service = await prisma.service.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        published: false, // Unpublish when deleted
      },
    });

    revalidatePath("/");
    revalidatePath("/services");
    if (existing?.slug) {
      revalidatePath(`/services/${existing.slug}`);
    }

    return NextResponse.json({ service });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}
