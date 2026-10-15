import { NextResponse } from "next/server";
import { getAdminActor, type AdminActor } from "./auth";

export async function requireAdminActor(): Promise<
  { actor: AdminActor } | { response: NextResponse }
> {
  const actor = await getAdminActor();
  if (!actor) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { actor };
}

export function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}
