import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const email = await getAdminSession();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { updates } = await request.json();

    await Promise.all(
      updates.map((update: { id: string; sortOrder: number }) =>
        prisma.faqItem.update({
          where: { id: update.id },
          data: { sortOrder: update.sortOrder },
        })
      )
    );

    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder FAQs:", error);
    return NextResponse.json(
      { error: "Failed to reorder FAQs" },
      { status: 500 }
    );
  }
}
