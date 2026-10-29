import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  INSIGHT_STRATEGY_CALL_KEY,
  validateInsightStrategyCallCopy,
} from "@/lib/insight-strategy-call";

export async function POST(request: NextRequest) {
  const email = await getAdminSession();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const validated = validateInsightStrategyCallCopy(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  try {
    await prisma.siteContent.upsert({
      where: { key: INSIGHT_STRATEGY_CALL_KEY },
      update: { value: validated.value },
      create: { key: INSIGHT_STRATEGY_CALL_KEY, value: validated.value },
    });
  } catch (error) {
    console.error("Failed to save insight strategy call copy:", error);
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }

  revalidatePath("/insights");
  return NextResponse.json({ success: true, value: validated.value });
}
