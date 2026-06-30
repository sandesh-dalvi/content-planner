import "server-only";
import { prisma } from "./prisma";

/**
 * Converts a name into a URL-safe slug and guarantees uniqueness
 * by appending a short random suffix if the base slug is taken.
 */
export async function generateUniqueWorkspaceSlug(
  name: string,
): Promise<string> {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|_$)/g, "");

  const existing = await prisma.workspace.findUnique({
    where: { slug: base },
    select: { id: true },
  });

  if (!existing) return base;

  // Base slug taken - append a short random suffix
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}
