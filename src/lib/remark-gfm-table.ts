import { gfmTableFromMarkdown } from "mdast-util-gfm-table";
import { gfmTable } from "micromark-extension-gfm-table";
import type {} from "remark-parse";
import type { Plugin } from "unified";

/**
 * Parse GitHub-style pipe tables.
 * Other GFM features (autolinks, strikethrough, task lists, footnotes)
 * stay off so existing Insights bodies render the same way.
 */
const remarkGfmTable: Plugin = function remarkGfmTable() {
  const data = this.data();
  const micromarkExtensions = data.micromarkExtensions || (data.micromarkExtensions = []);
  const fromMarkdownExtensions =
    data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);

  micromarkExtensions.push(gfmTable());
  fromMarkdownExtensions.push(gfmTableFromMarkdown());
};

export default remarkGfmTable;
