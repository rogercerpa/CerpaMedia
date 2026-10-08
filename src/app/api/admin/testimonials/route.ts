import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const email = await getAdminSession();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, role, quote, link, published } = await request.json();

    const maxSortOrder = await prisma.testimonial.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        role,
        quote,
        link: link || null,
        published: published ?? false,
        sortOrder: (maxSortOrder?.sortOrder ?? -1) + 1,
      },
    });

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error("Failed to create testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
