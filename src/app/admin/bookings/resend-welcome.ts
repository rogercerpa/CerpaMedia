"use server";

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { resendLaunchWelcome } from "@/lib/launch-purchase";

export async function resendLaunchWelcomeAction(formData: FormData) {
  const email = await getAdminSession();
  if (!email) redirect("/admin/login");

  const id = String(formData.get("purchaseId") || "");
  const result = await resendLaunchWelcome(id);
  redirect(`/admin/bookings?welcome=${result}`);
}
