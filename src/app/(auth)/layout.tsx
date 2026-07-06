import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Route } from "next";

/**
 * Layout for the (auth) route group — /sign-in and /sign-up.
 * If the user already has an active session, send them straight to
 * the dashboard so they never see the blank Clerk widget state.
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard" as Route);
  }

  return <>{children}</>;
}
