import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { getWorkspaceByUserId } from "@/db/queries/workspace.queries";
import { notFound } from "next/navigation";
import { getCalendarPosts } from "@/db/queries/posts.queries";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { CalendarView } from "@/components/calendar/calendar-view";

export const metadata: Metadata = { title: "Calendar" };

export default async function CalendarPage() {
  const { userId } = await requireAuth();
  const workspace = await getWorkspaceByUserId(userId);

  if (!workspace) notFound();

  const posts = await getCalendarPosts(workspace.id);

  return (
    <div className=" flex h-full flex-col">
      <div className=" mb-6 flex items-center justify-between">
        <div className="">
          <h1 className=" text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className=" mt-1 text-sm text-muted-foreground">
            {posts.length} scheduled post{posts.length > 1 ? "s" : ""}
          </p>
        </div>

        <Button asChild>
          <Link href={"/posts/new"}>
            <Plus className=" mr-2 h-4 w-4" /> New Post
          </Link>
        </Button>
      </div>

      {/* CalendarView */}
      <div className=" min-h-0 flex-1">
        <CalendarView initialPosts={posts} />
      </div>
    </div>
  );
}
