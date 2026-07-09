/**
 * Platform colours used as event backgrounds in the calendar.
 * These are the fixed brand hex values — same light and dark
 * (the calendar renders on a white/dark surface and the event
 * chip needs sufficient contrast on its own background).
 */
export const PLATFORM_BG_COLORS: Record<string, string> = {
  INSTAGRAM: "#E1306C",
  LINKEDIN: "#0A66C2",
  TWITTER: "#1DA1F2",
  FACEBOOK: "#1877F2",
  TIKTOK: "#444444", // Original black is invisible; dark gray for legibility
  YOUTUBE: "#CC0000",
};

export const PLATFORM_EMOJI: Record<string, string> = {
  INSTAGRAM: "📸",
  LINKEDIN: "💼",
  TWITTER: "🐦",
  FACEBOOK: "📘",
  TIKTOK: "🎵",
  YOUTUBE: "▶️",
};

/**
 * Status dot colours derived from CSS variables.
 * We use inline style references because Tailwind purges
 * arbitrary CSS variable values on calendar classes.
 */
export const STATUS_DOT_COLORS: Record<string, string> = {
  DRAFT: "var(--status-draft)",
  IN_REVIEW: "var(--status-review)",
  APPROVED: "var(--status-approved)",
  SCHEDULED: "var(--status-scheduled)",
  PUBLISHED: "var(--status-published)",
};
