import type { KanbanColumn } from "@/types";

/**
 * Ordered column definitions for the Kanban board.
 * The order here determines visual left-to-right order.
 * Changing this file updates every column label in the app.
 */
export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: "DRAFT", label: "Draft" },
  { id: "IN_REVIEW", label: "In Review" },
  { id: "APPROVED", label: "Approved" },
  { id: "SCHEDULED", label: "Scheduled" },
  { id: "PUBLISHED", label: "Published" },
];

/**
 * Maps PostStatus to the CSS variable tokens defined in globals.css.
 * These tokens already exist — we just reference them here.
 */
export const STATUS_COLORS: Record<string, string> = {
  DRAFT: "var(--status-draft)",
  IN_REVIEW: "var(--status-review)",
  APPROVED: "var(--status-approved)",
  SCHEDULED: "var(--status-scheduled)",
  PUBLISHED: "var(--status-published)",
};

export const PLATFORM_EMOJI: Record<string, string> = {
  INSTAGRAM: "📸",
  LINKEDIN: "💼",
  TWITTER: "🐦",
  FACEBOOK: "📘",
  TIKTOK: "🎵",
  YOUTUBE: "▶️",
};
