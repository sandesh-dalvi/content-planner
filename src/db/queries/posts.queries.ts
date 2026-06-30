import "server-only";

import { Platform, PostStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

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
      ...(filters?.from || filters?.to
        ? {
            scheduledFor: {
              ...(filters.from && { gte: filters.from }),
              ...(filters.to && { lte: filters.to }),
            },
          }
        : {}),
    },
    include: {
      media: {
        select: {
          id: true,
          url: true,
          mimeType: true,
          width: true,
          height: true,
        },
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
