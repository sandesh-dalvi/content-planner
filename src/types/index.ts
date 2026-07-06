/**
 * Represents the JSON output of TipTap's editor.getJSON().
 * Used wherever TipTap content is stored, passed, or validated.
 * The `type` field is always present (e.g. "doc", "paragraph", "text").
 * `[key: string]: unknown` covers attrs, marks, text, and any extension fields.
 */
export type TipTapContent = {
  type: string;
  content?: TipTapContent[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  attrs?: Record<string, unknown>;
  [key: string]: unknown;
};
