import type { InsightStrategyCallCopy } from "@/lib/insight-strategy-call";
import {
  STRATEGY_CALL_BUTTON_LABEL,
  STRATEGY_CALL_HREF,
  STRATEGY_CALL_LEAD,
} from "@/lib/insight-strategy-call";
import { StrategyCallLink } from "./StrategyCallLink";

export function InsightStrategyCallBox({ copy }: { copy: InsightStrategyCallCopy }) {
  return (
    <aside
      aria-label="Technology Strategy Call"
      className="border border-border bg-charcoal text-white p-8 md:p-10"
      data-strategy-call-box="true"
    >
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4 text-white">
        {copy.headline}
      </h2>
      <p className="text-[15px] text-white/90 leading-relaxed mb-4">{copy.creditLine}</p>
      <p className="text-[15px] text-white/90 leading-relaxed mb-6">{STRATEGY_CALL_LEAD}</p>
      <StrategyCallLink
        href={STRATEGY_CALL_HREF}
        className="inline-block w-full sm:w-auto text-center bg-white text-charcoal px-8 py-3.5 text-[15px] font-medium hover:bg-gray-100 transition-all duration-200 hover:-translate-y-0.5"
      >
        {STRATEGY_CALL_BUTTON_LABEL}
      </StrategyCallLink>
    </aside>
  );
}
