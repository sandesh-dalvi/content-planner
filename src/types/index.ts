import type {
  Post,
  Media,
  PostStatus,
} from "@/generated/prisma/client";

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

/**
 * The subset of Post fields the Kanban board needs.
 * Using Pick keeps the type tight — the board never
 * accesses content (JSONB) which would be wasteful to
 * pass through React's serialization boundary.
 */
export type KanbanPost = Pick<
  Post,
  "id" | "title" | "platform" | "status" | "scheduledFor" | "createdAt"
> & { media: Array<Pick<Media, "id" | "url">> };

export interface KanbanColumn {
  id: PostStatus;
  label: string;
}
