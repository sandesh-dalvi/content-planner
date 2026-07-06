import { KanbanBoard } from "@/components/kanban/kanban-board";
import { Button } from "@/components/ui/button";
import { getKanbanPosts } from "@/db/queries/posts.queries";
import { getWorkspaceByUserId } from "@/db/queries/workspace.queries";
import { requireAuth } from "@/lib/auth";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Posts - Kanban" };

export default async function KanbanPage() {
  const { userId } = await requireAuth();
  const workspace = await getWorkspaceByUserId(userId);

  if (!workspace) notFound();

  const posts = await getKanbanPosts(workspace.id);

  return (
    <div className=" flex h-full flex-col">
      <div className=" mb-6 flex items-center justify-between">
        <div className="">
          <h1 className=" text-2xl font-semibold tracking-tight">Posts</h1>
          <p className=" mt-1 text-sm text-muted-foreground">
            {posts.length} posts{posts.length > 1 ? "s" : ""}
          </p>
        </div>

        <Button asChild>
          <Link href={"/posts/new"}>
            <Plus className=" mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <div className=" min-h-0 flex-1 overflow-x-auto">
        <KanbanBoard initialPosts={posts} />
      </div>
    </div>
  );
}
