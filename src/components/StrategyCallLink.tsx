"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { STRATEGY_CALL_HREF } from "@/lib/insight-strategy-call";
import { trackStrategyCallClick } from "./track-client-event";

export function StrategyCallLink({
  href = STRATEGY_CALL_HREF,
  className,
  children,
}: {
  href?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      data-strategy-call="99"
      onClick={() => {
        trackStrategyCallClick();
      }}
    >
      {children}
    </Link>
  );
}
