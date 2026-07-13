/**
 * Platform chart colours — fixed brand hex values.
 * Same in light and dark mode (the chart handles contrast internally).
 */
export const PLATFORM_CHART_COLORS: Record<string, string> = {
  INSTAGRAM: "#E1306C",
  LINKEDIN: "#0A66C2",
  TWITTER: "#1DA1F2",
  FACEBOOK: "#1877F2",
  TIKTOK: "#444444",
  YOUTUBE: "#CC0000",
};

/**
 * Status chart colours — reference the CSS variables from globals.css.
 * Must be hex values (not CSS variables) because Recharts renders SVG,
 * and SVG fill/stroke attributes do not resolve CSS custom properties
 * in all browsers. We use the same underlying colours as the vars.
 */
export const STATUS_CHART_COLORS: Record<string, string> = {
  DRAFT: "#6b7280", // same as --status-draft
  IN_REVIEW: "#f59e0b", // same as --status-review
  APPROVED: "#10b981", // same as --status-approved
  SCHEDULED: "#3b82f6", // same as --status-scheduled
  PUBLISHED: "#7c3aed", // same as --status-published (brand violet)
};

export const PLATFORM_LABELS: Record<string, string> = {
  INSTAGRAM: "Instagram",
  LINKEDIN: "LinkedIn",
  TWITTER: "Twitter",
  FACEBOOK: "Facebook",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
};

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "In Review",
  APPROVED: "Approved",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
};
