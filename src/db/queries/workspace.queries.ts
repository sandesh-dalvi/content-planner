import "server-only";

import { Workspace } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Get the workspace for the current user.
 * Every dashboard page calls this to scope its data.
 * Returns null if the user has not yet created a workspace.
 */
export async function getWorkspaceByUserId(
  userId: string,
): Promise<Workspace | null> {
  return prisma.workspace.findUnique({
    where: { userId },
  });
}

/**
 * Get workspace by slug (used in URL-based routing in v2).
 */
export async function ggetWorkspaceBySlug(
  slug: string,
): Promise<Workspace | null> {
  return prisma.workspace.findUnique({
    where: { slug },
  });
}
