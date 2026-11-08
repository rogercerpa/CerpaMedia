"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { STRATEGY_CALL_HREF } from "@/lib/insight-strategy-call";
import { trackStrategyCallClick } from "./track-client-event";

export function StrategyCallLink({
  href = STRATEGY_CALL_HREF,
  className,
  children,
  heroCta,
}: {
  href?: string;
  className?: string;
  children: ReactNode;
  heroCta?: boolean;
}) {
  return (
    <Link
      href={href}
      className={className}
      data-strategy-call="99"
      {...(heroCta ? { "data-hero-cta": "book" } : {})}
      onClick={() => {
        trackStrategyCallClick();
      }}
    >
      {children}
    </Link>
  );
}
