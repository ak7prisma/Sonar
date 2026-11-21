import DOMPurify from "isomorphic-dompurify";

const ALLOWED_HTML_TAGS = [
  "article",
  "section",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "code",
  "pre",
  "blockquote",
  "table",
  "caption",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "figure",
  "figcaption",
  "span",
  "br",
  "sub",
  "sup",
  "math",
  "semantics",
  "mrow",
  "mi",
  "mo",
  "mn",
  "ms",
  "mtext",
  "mfrac",
  "msup",
  "msub",
  "msubsup",
  "msqrt",
  "mroot",
  "mtable",
  "mtr",
  "mtd",
  "munder",
  "mover",
  "munderover",
  "annotation",
];

const ALLOWED_ATTRS = [
  "scope",
  "colspan",
  "rowspan",
  "lang",
  "dir",
  "display",
  "xmlns",
  "encoding",
  "mathvariant",
  "aria-label",
  "role",
];

/**
 * Sanitizes document HTML and MathML derived from PDF extraction or AI responses
 * to prevent XSS while preserving screen-reader semantics and MathML structure.
 */
export function sanitizeDocumentHtml(unsafeHtml: string): string {
  return DOMPurify.sanitize(unsafeHtml, {
    ALLOWED_TAGS: ALLOWED_HTML_TAGS,
    ALLOWED_ATTR: ALLOWED_ATTRS,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onfocus", "style"],
  });
}

/**
 * Strips instruction-like control markers from untrusted document excerpts
 * before embedding them inside RAG system contexts.
 */
export function sanitizeRagSourceText(raw: string): string {
  return raw
    .replace(/<\/?untrusted_document_source[^>]*>/gi, "")
    .replace(/<\/?system[^>]*>/gi, "")
    .replace(/\u0000/g, "")
    .trim();
}
