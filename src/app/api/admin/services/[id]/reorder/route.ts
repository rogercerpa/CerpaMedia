import { NextRequest, NextResponse } from "next/server";
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
    const body = await request.json();
    const { direction } = body;

    if (direction !== "up" && direction !== "down") {
      return NextResponse.json(
        { error: "Invalid direction" },
        { status: 400 }
      );
    }

    // Find the current service
    const current = await prisma.service.findUnique({
      where: { id },
    });

    if (!current) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Find the service to swap with
    const swapWith = await prisma.service.findFirst({
      where: {
        deletedAt: null,
        sortOrder: direction === "up" 
          ? { lt: current.sortOrder }
          : { gt: current.sortOrder },
      },
      orderBy: {
        sortOrder: direction === "up" ? "desc" : "asc",
      },
    });

    if (!swapWith) {
      return NextResponse.json(
        { error: "Cannot move further in that direction" },
        { status: 400 }
      );
    }

    // Swap sort orders
    await prisma.$transaction([
      prisma.service.update({
        where: { id: current.id },
        data: { sortOrder: swapWith.sortOrder },
      }),
      prisma.service.update({
        where: { id: swapWith.id },
        data: { sortOrder: current.sortOrder },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering service:", error);
    return NextResponse.json(
      { error: "Failed to reorder service" },
      { status: 500 }
    );
  }
}
