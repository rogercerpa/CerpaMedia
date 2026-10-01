import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const email = await getAdminSession();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    await prisma.dateAvailability.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting date availability:", error);
    
    if (error.code === "P2021") {
      return NextResponse.json(
        { 
          error: "DateAvailability table does not exist. Please run: npx prisma db push",
          code: "TABLE_MISSING"
        },
        { status: 503 }
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Date availability not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete date availability" },
      { status: 500 }
    );
  }
}
