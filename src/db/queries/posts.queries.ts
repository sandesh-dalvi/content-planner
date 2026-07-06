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
 * Get dashboard stats for a workspace.
 * Uses count aggregations — no full rows returned.
 */
export async function getPostStats(workspaceId: string) {
  const [total, byStatus, byPlatform] = await Promise.all([
    // Total post count
    prisma.post.count({ where: { workspaceId } }),

    // Count per status (for status breakdown chart)
    prisma.post.groupBy({
      by: ["status"],
      where: { workspaceId },
      _count: { status: true },
    }),

    // Count per platform (for platform donut chart)
    prisma.post.groupBy({
      by: ["platform"],
      where: { workspaceId },
      _count: { platform: true },
    }),
  ]);

  return { total, byStatus, byPlatform };
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
