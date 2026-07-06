// src/components/posts/posts-empty-state.tsx
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PostsEmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-border">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No posts yet</h3>
      <p className="mb-6 mt-2 text-center text-sm text-muted-foreground max-w-sm">
        Create your first post to start planning your content calendar.
      </p>
      <Button asChild>
        <Link href="/posts/new">
          <Plus className="mr-2 h-4 w-4" />
          Create your first post
        </Link>
      </Button>
    </div>
  );
}
