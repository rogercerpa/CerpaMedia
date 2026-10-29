"use client";

import { useEffect } from "react";
import { postClientEvent } from "./track-client-event";

export function InsightReadTracker({ slug }: { slug: string }) {
  useEffect(() => {
    postClientEvent({ event: "insight_read", slug });
  }, [slug]);

  return null;
}
