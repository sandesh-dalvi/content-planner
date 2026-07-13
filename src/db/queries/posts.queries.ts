import "server-only";

import { Platform, PostStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { KanbanPost } from "@/types";

// Type for filter parameters used across Kanban, Calendar, and List views
export interface PostFilters {
  platform?: Platform;
  status?: PostStatus;
  from?: Date;
  to?: Date;
}

/**
 * Get all posts for a workspace with optional filters.
 * Used by: Kanban board, post list view.
 */
export async function getPostsByWorkspace(
  workspaceId: string,
  filters?: PostFilters,
) {
  return prisma.post.findMany({
    where: {
      workspaceId,
      ...(filters?.platform && { platform: filters.platform }),
      ...(filters?.status && { status: filters.status }),
    },
    include: {
      media: {
        select: { id: true, url: true, mimeType: true, filename: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get a single post by ID, scoped to workspace for security.
 */
export async function getPostById(postId: string, workspaceId: string) {
  return prisma.post.findUnique({
    where: { id: postId, workspaceId },
    include: {
      media: true,
    },
  });
}

/**
 * Fetches all posts for the Kanban board.
 * Selects only the fields the board renders — excludes
 * the content JSONB column since cards never show it.
 */
export async function getKanbanPosts(
  workspaceId: string,
): Promise<KanbanPost[]> {
  return prisma.post.findMany({
    where: { workspaceId },
    select: {
      id: true,
      title: true,
      platform: true,
      status: true,
      scheduledFor: true,
      createdAt: true,
      media: {
        select: { id: true, url: true },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Returns aggregated stats for the analytics dashboard.
 * Uses Promise.all so all three queries run in parallel.
 * Avoids fetching any post content or media — pure counts.
 */
export async function getPostStats(workspaceId: string) {
  const [total, byStatus, byPlatform, scheduled, published] = await Promise.all(
    [
      // total posts
      prisma.post.count({
        where: { workspaceId },
      }),

      // count per status
      prisma.post.groupBy({
        by: ["status"],
        where: { workspaceId },
        _count: { status: true },
        orderBy: { status: "desc" },
      }),

      // count per platform
      prisma.post.groupBy({
        by: ["platform"],
        where: { workspaceId },
        _count: { platform: true },
        orderBy: { platform: "asc" },
      }),

      // Scheduled posts
      prisma.post.count({
        where: { workspaceId, status: "SCHEDULED" },
      }),

      // Published posts
      prisma.post.count({
        where: { workspaceId, status: "PUBLISHED" },
      }),
    ],
  );

  return { total, byStatus, byPlatform, scheduled, published };
}
