import type { ComponentProps, ReactNode } from "react";
import ReactMarkdown, { type Components, type ExtraProps } from "react-markdown";
import { StrategyCallLink } from "@/components/StrategyCallLink";
import {
  consultPath,
  isInBodyStrategyCallLink,
  reactNodeText,
  STRATEGY_CALL_INLINE_LABEL,
} from "@/lib/insight-strategy-call";
import remarkGfmTable from "@/lib/remark-gfm-table";

function cellFrame(children: ReactNode) {
  return <div className="min-w-[7.5rem] max-w-[18rem] break-words">{children}</div>;
}

type CellProps = ComponentProps<"td"> & ExtraProps;
type HeaderProps = ComponentProps<"th"> & ExtraProps;

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-semibold text-text mb-4 mt-8 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-semibold text-text mb-3 mt-8 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-semibold text-text mb-2 mt-6 first:mt-0">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-[15px] text-text-muted leading-relaxed mb-4">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-4 space-y-2 text-[15px] text-text-muted">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-4 space-y-2 text-[15px] text-text-muted">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-[15px] text-text-muted leading-relaxed">{children}</li>
  ),
  a: ({ href, children }) => {
    if (consultPath(href)) {
      return (
        <StrategyCallLink
          href="/consult"
          className="text-text underline hover:text-text-muted transition-colors"
        >
          {isInBodyStrategyCallLink(href, reactNodeText(children))
            ? STRATEGY_CALL_INLINE_LABEL
            : children}
        </StrategyCallLink>
      );
    }
    return (
      <a
        href={href}
        className="text-text underline hover:text-text-muted transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-border pl-4 italic text-text-muted my-4">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="bg-bg-subtle px-1.5 py-0.5 text-sm text-text font-mono">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="bg-bg-subtle p-4 overflow-x-auto mb-4 text-sm">{children}</pre>
  ),
  // `text-left` overrides the browser's centered headers. A GFM alignment
  // marker arrives as `style.textAlign` and overrides that default.
  table: ({ children }) => (
    <div
      tabIndex={0}
      role="region"
      aria-label="Scrollable table"
      className="my-6 max-w-full overflow-x-auto [scrollbar-width:thin] [scrollbar-color:#a3a3a3_transparent] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
    >
      <table className="w-max min-w-full border-collapse border border-border text-left text-[14px]">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-bg-subtle text-text">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="even:bg-bg-subtle">{children}</tr>,
  th: ({ children, style }: HeaderProps) => (
    <th
      scope="col"
      style={style}
      className="text-left border border-border px-3 py-2.5 align-bottom text-[13px] font-semibold leading-snug text-text"
    >
      {cellFrame(children)}
    </th>
  ),
  td: ({ children, style }: CellProps) => (
    <td
      style={style}
      className="text-left border border-border px-3 py-2.5 align-top text-[14px] leading-relaxed text-text-muted [&_strong]:font-semibold [&_strong]:text-text"
    >
      {cellFrame(children)}
    </td>
  ),
};

const remarkPlugins = [remarkGfmTable];

export function InsightMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
      {children}
    </ReactMarkdown>
  );
}
