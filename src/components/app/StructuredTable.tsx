import { sanitizeDocumentHtml } from "@/lib/accessibility/sanitize";
import type { DocumentTableRow } from "@/lib/data/workspace";

function toStringList(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.map((cell) => String(cell ?? "")) : [];
}

function toStringGrid(raw: unknown): string[][] {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) =>
    Array.isArray(row)
      ? row.map((cell) => String(cell ?? ""))
      : [String(row ?? "")]
  );
}

/**
 * Renders sanitized table HTML when present, or builds a semantic accessible
 * <table> from structured `document_tables` JSON data.
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
  if (html?.trim()) {
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: sanitizeDocumentHtml(html),
        }}
      />
    );
  }

  if (table) {
    const headers = toStringList(table.headers);
    const rows = toStringGrid(table.rows);

    return (
      <table className="w-full border-collapse text-left text-sm">
        {table.caption ? (
          <caption className="px-3 py-2 text-left font-semibold text-foreground">
            {table.caption}
          </caption>
        ) : null}
        <thead>
          <tr className="border-b border-border bg-surface-subtle">
            {headers.map((header, idx) => (
              <th key={idx} scope="col" className="p-2.5 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="border-b border-border/60 last:border-b-0">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="p-2.5">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return <p className="p-3 text-sm">{fallbackText}</p>;
}
