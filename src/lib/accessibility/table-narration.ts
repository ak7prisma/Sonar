import type { ReaderLanguage } from "@/stores/accessibility-store";
import type { DocumentTableRow } from "@/lib/data/workspace";
import { narrateMixedText } from "@/features/math-ocr/math-narration";

export interface ParsedTableData {
  caption?: string;
  headers: string[];
  rows: string[][];
}

function toStringList(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.map((cell) => String(cell ?? "").trim()) : [];
}

function toStringGrid(raw: unknown): string[][] {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) =>
    Array.isArray(row)
      ? row.map((cell) => String(cell ?? "").trim())
      : [String(row ?? "").trim()]
  );
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts structured caption, headers, and rows from structured DB rows,
 * raw HTML <table> markup, or Markdown pipe tables.
 */
export function parseTableData(
  html?: string | null,
  table?: DocumentTableRow | null,
  fallbackText?: string | null
): ParsedTableData {
  // 1. Try structured DocumentTableRow first
  if (table) {
    const headers = toStringList(table.headers);
    const rows = toStringGrid(table.rows);
    if (headers.length > 0 || rows.length > 0) {
      return {
        caption: table.caption ? table.caption.trim() : undefined,
        headers,
        rows,
      };
    }
  }

  // 2. Try parsing raw HTML <table>
  if (html && html.includes("<table")) {
    try {
      let caption: string | undefined;
      const captionMatch = html.match(/<caption[^>]*>([\s\S]*?)<\/caption>/i);
      if (captionMatch) {
        caption = stripHtml(captionMatch[1]);
      }

      const headers: string[] = [];
      const rows: string[][] = [];

      // Look for thead or first tr with th
      const theadMatch = html.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i);
      if (theadMatch) {
        const thMatches = theadMatch[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi);
        for (const m of thMatches) {
          headers.push(stripHtml(m[1]));
        }
      }

      // Look for tbody, or if no tbody, table content excluding thead
      let bodyHtml = html;
      const tbodyMatch = html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
      if (tbodyMatch) {
        bodyHtml = tbodyMatch[1];
      } else if (theadMatch) {
        bodyHtml = html.replace(/<thead[^>]*>[\s\S]*?<\/thead>/i, "");
      }

      // Look for all tr tags in body
      const trMatches = bodyHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
      for (const tr of trMatches) {
        const rowContent = tr[1];
        // If headers weren't found in thead, check if row has only th
        if (headers.length === 0 && !/<td[^>]*>/i.test(rowContent) && /<th[^>]*>/i.test(rowContent)) {
          const ths = rowContent.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi);
          for (const m of ths) {
            headers.push(stripHtml(m[1]));
          }
          continue;
        }

        const cells: string[] = [];
        const cellMatches = rowContent.matchAll(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi);
        for (const c of cellMatches) {
          cells.push(stripHtml(c[1]));
        }
        if (cells.length > 0) {
          rows.push(cells);
        }
      }

      if (headers.length > 0 || rows.length > 0) {
        return { caption, headers, rows };
      }
    } catch {
      // Ignore parse failure, proceed to fallback
    }
  }

  // 3. Try parsing Markdown pipe table from fallbackText
  if (fallbackText && fallbackText.includes("|")) {
    const lines = fallbackText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.startsWith("|") && l.endsWith("|"));

    if (lines.length >= 2) {
      const parseLine = (l: string) =>
        l
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim());

      const headers = parseLine(lines[0]);
      let startIndex = 1;
      // If second line is separator | --- | --- |, skip it
      if (/^\|[\s\-:|]+\|$/.test(lines[1])) {
        startIndex = 2;
      }
      const rows = lines.slice(startIndex).map(parseLine);
      return { headers, rows };
    }
  }

  return {
    caption: fallbackText?.trim() || undefined,
    headers: [],
    rows: [],
  };
}

/**
 * Transforms tabular data into natural, fully accessible speech for screen readers
 * and the audio synthesizer, ensuring mathematical expressions in cells are translated
 * into clear vocalized terms.
 */
export function narrateTable(
  data: ParsedTableData,
  lang: ReaderLanguage = "id"
): string {
  const parts: string[] = [];

  if (lang === "id") {
    if (data.caption) {
      parts.push(`Tabel: ${data.caption}.`);
    } else {
      parts.push("Tabel data.");
    }

    if (data.headers.length > 0) {
      const headerList = data.headers
        .map((h) => narrateMixedText(h, "id"))
        .join(", ");
      parts.push(`Terdiri dari ${data.headers.length} kolom: ${headerList}.`);
    }

    data.rows.forEach((row, rIdx) => {
      const rowNum = rIdx + 1;
      const cellDescriptions = row.map((cell, cIdx) => {
        const header = data.headers[cIdx];
        const cellText = narrateMixedText(cell, "id");
        return header ? `${header}: ${cellText}` : cellText;
      });
      parts.push(`Baris ${rowNum}: ${cellDescriptions.join(", ")}.`);
    });
  } else {
    if (data.caption) {
      parts.push(`Table: ${data.caption}.`);
    } else {
      parts.push("Data table.");
    }

    if (data.headers.length > 0) {
      const headerList = data.headers
        .map((h) => narrateMixedText(h, "en"))
        .join(", ");
      parts.push(`Contains ${data.headers.length} columns: ${headerList}.`);
    }

    data.rows.forEach((row, rIdx) => {
      const rowNum = rIdx + 1;
      const cellDescriptions = row.map((cell, cIdx) => {
        const header = data.headers[cIdx];
        const cellText = narrateMixedText(cell, "en");
        return header ? `${header}: ${cellText}` : cellText;
      });
      parts.push(`Row ${rowNum}: ${cellDescriptions.join(", ")}.`);
    });
  }

  return parts.join(" ");
}
