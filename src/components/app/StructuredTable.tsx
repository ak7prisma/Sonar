"use client";

import { useMemo } from "react";
import { sanitizeDocumentHtml } from "@/lib/accessibility/sanitize";
import type { DocumentTableRow } from "@/lib/data/workspace";
import { FormattedMathText } from "@/components/document/FormattedMathText";
import { parseTableData } from "@/lib/accessibility/table-narration";

/**
 * Renders an accessible, semantic <table> from structured JSON or raw HTML,
 * ensuring all cells, mathematical expressions (LaTeX), and headers are rendered
 * via KaTeX with standard table accessibility attributes.
 */
export function StructuredTable({
  html,
  table,
  fallbackText,
}: {
  html?: string | null;
  table?: DocumentTableRow;
  fallbackText: string;
}) {
  const data = useMemo(
    () => parseTableData(html, table, fallbackText),
    [html, table, fallbackText]
  );

  // If no structured table headers or rows could be parsed, fallback to HTML or text
  if (data.headers.length === 0 && data.rows.length === 0) {
    if (html?.trim()) {
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: sanitizeDocumentHtml(html),
          }}
        />
      );
    }
    return <p className="p-3 text-sm">{fallbackText}</p>;
  }

  return (
    <table className="w-full border-collapse text-left text-sm">
      {data.caption ? (
        <caption className="px-3 py-2 text-left font-semibold text-foreground">
          <FormattedMathText text={data.caption} as="span" />
        </caption>
      ) : null}
      <thead>
        <tr className="border-b border-border bg-surface-subtle">
          {data.headers.map((header, idx) => (
            <th
              key={idx}
              scope="col"
              className="p-2.5 font-semibold text-foreground"
            >
              <FormattedMathText text={header} as="span" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, rIdx) => (
          <tr
            key={rIdx}
            className="border-b border-border/60 last:border-b-0 hover:bg-surface-subtle/40"
          >
            {row.map((cell, cIdx) => (
              <td key={cIdx} className="p-2.5 text-foreground">
                <FormattedMathText text={cell} as="span" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
