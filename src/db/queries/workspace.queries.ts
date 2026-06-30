import "server-only";

import { Workspace } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { generateUniqueWorkspaceSlug } from "@/lib/slug";

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
 * Returns the user's workspace, creating the User + Workspace
 * rows on the fly if they don't exist yet.
 *
 * This is the safety net against webhook delivery delay.
 * Called from the dashboard layout on every request — cheap
 * after the first call since it's just one indexed lookup
 * once the rows exist.
 */
export async function getOrCreateWorkspace(
  userId: string,
  email: string,
  name: string | null,
  image: string | null,
): Promise<Workspace> {
  // workspce already exists
  const existing = await prisma.workspace.findUnique({ where: { userId } });
  if (existing) return existing;

  // first visit, webhook may not have fired yet.
  // Upsert the User first (webhook might arrive moments later and
  // attempt the same upsert — this must not throw on conflict).

  await prisma.user.upsert({
    where: { id: userId },
    update: { email, name, image },
    create: { id: userId, email, name, image },
  });

  const workspaceName = name ? `${name}'s Workspace` : "My Workspace";
  const slug = await generateUniqueWorkspaceSlug(workspaceName);

  return prisma.workspace.create({
    data: {
      userId,
      name: workspaceName,
      slug,
    },
  });
}

/**
 * Get workspace by slug (used in URL-based routing in v2).
 */
export async function getWorkspaceBySlug(
  slug: string,
): Promise<Workspace | null> {
  return prisma.workspace.findUnique({
    where: { slug },
  });
}
