import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const email = await getAdminSession();

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, slug, summary, body: bodyMd, tags, status } = body;

    if (!title || !slug || !summary || !bodyMd || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if post exists
    const existing = await prisma.insightPost.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if slug is taken by another post
    if (slug !== existing.slug) {
      const slugTaken = await prisma.insightPost.findUnique({
        where: { slug },
      });

      if (slugTaken) {
        return NextResponse.json(
          { error: "A post with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Set publishedAt if publishing for the first time
    let publishedAt = existing.publishedAt;
    if (status === "published" && !existing.publishedAt) {
      publishedAt = new Date();
    } else if (status === "draft") {
      publishedAt = null;
    }

    const post = await prisma.insightPost.update({
      where: { id },
      data: {
        title,
        slug,
        summary,
        body: bodyMd,
        tags: tags || [],
        status,
        publishedAt,
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error updating insight post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}
