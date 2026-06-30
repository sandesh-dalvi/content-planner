import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Route } from "next";

/**
 * Use at the top of any protected Server Component.
 * Confirms the session server-side, independent of proxy.ts.
 * This is the defense-in-depth layer — even if proxy.ts is
 * misconfigured or bypassed, this guarantees no protected
 * page renders without a valid session.
 */
export async function requireAuth() {
  const { userId, isAuthenticated } = await auth();

  if (!isAuthenticated || !userId) {
    redirect("/sign-in" as Route);
  }

  return { userId };
}

/**
 * When need full Clerk user details
 * (email, name, image) — not just the ID.
 * Slightly more expensive than requireAuth() since it
 * fetches the full user object — need to use only when needed.
 */
export async function requireCurrentUser() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in" as Route);
  }

  return user;
}
