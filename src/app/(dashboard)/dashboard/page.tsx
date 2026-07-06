import { requireAuth } from "@/lib/auth";
import { getWorkspaceByUserId } from "@/db/queries/workspace.queries";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const { userId } = await requireAuth();
  const workspace = await getWorkspaceByUserId(userId);

  if (!workspace) notFound();

  const postCount = await prisma.post.count({
    where: { workspaceId: workspace.id },
  });

  return (
    <div className="">
      <h1>Dashboard</h1>
      <p className="">Total posts: {postCount}</p>
    </div>
  );
}
