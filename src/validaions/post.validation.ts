import * as z from "zod";
import type { TipTapContent } from "@/types";

export const PlatformEnum = z.enum([
  "INSTAGRAM",
  "LINKEDIN",
  "TWITTER",
  "FACEBOOK",
  "TIKTOK",
  "YOUTUBE",
]);

export const PostStatusEnum = z.enum([
  "DRAFT",
  "IN_REVIEW",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
]);

export const PLATFORM_LIMITS = {
  INSTAGRAM: 2200,
  LINKEDIN: 3000,
  TWITTER: 280,
  FACEBOOK: 63206,
  TIKTOK: 2200,
  YOUTUBE: 5000,
} as const;

export const mediaInputSchema = z.object({
  url: z.string().url(),
  filename: z.string(),
  mimeType: z.string(),
  size: z.number(),
});

export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, { error: "Title is required" })
    .max(200, { error: "Title cannot exceed 200 characters" }),

  content: z.custom<TipTapContent>(
    (val): val is TipTapContent =>
      typeof val === "object" &&
      val !== null &&
      typeof (val as Record<string, unknown>).type === "string",
    { error: "Content is required" },
  ),

  platform: PlatformEnum,

  // ✅ No .default() — input and output types are identical (both required)
  // The 'DRAFT' default lives in PostForm's defaultValues where it belongs
  status: PostStatusEnum,

  scheduledFor: z.string().nullish(),

  media: z.array(mediaInputSchema).optional(),
});

export const updatePostSchema = createPostSchema.partial();

export const updateStatusSchema = z.object({
  postId: z.string().min(1),
  status: PostStatusEnum,
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

