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
    const { question, answer, published } = await request.json();

    const maxSortOrder = await prisma.faqItem.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const faq = await prisma.faqItem.create({
      data: {
        question,
        answer,
        published: published ?? false,
        sortOrder: (maxSortOrder?.sortOrder ?? -1) + 1,
      },
    });

    revalidatePath("/");

    return NextResponse.json(faq);
  } catch (error) {
    console.error("Failed to create FAQ:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    );
  }
}
