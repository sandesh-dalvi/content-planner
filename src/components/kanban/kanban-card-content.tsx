import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLATFORM_EMOJI, STATUS_COLORS } from "@/lib/kanban-config";
import type { KanbanPost } from "@/types";

interface KanbanCardContentProps {
  post: KanbanPost;
  // When true (inside DragOverlay) we omit interactive elements
  // like the edit button to keep the overlay clean
  isOverlay?: boolean;
}

export function KanbanCardContent({
  post,
  isOverlay = false,
}: KanbanCardContentProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-3 shadow-sm",
        "flex flex-col gap-2",
        isOverlay && "shadow-xl ring-2 ring-primary/30 rotate-1",
      )}
    >
      {/* Thumbnail */}
      {post.media[0] && (
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.media[0].url}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Platform + Status */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {PLATFORM_EMOJI[post.platform]} {post.platform}
        </span>
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0"
          style={{
            borderColor: STATUS_COLORS[post.status],
            color: STATUS_COLORS[post.status],
          }}
        >
          {post.status.replace("_", " ")}
        </Badge>
      </div>

      {/* Title */}
      <p className="line-clamp-2 text-sm font-medium leading-snug text-card-foreground">
        {post.title}
      </p>

      {/* Scheduled date */}
      {post.scheduledFor && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(new Date(post.scheduledFor), "MMM d, h:mm a")}
        </div>
      )}

      {/* Edit link — only shown outside the overlay */}
      {!isOverlay && (
        <div className="flex justify-end pt-1 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            asChild
          >
            <Link href={`/posts/${post.id}/edit`}>
              <Edit className="mr-1 h-3 w-3" />
              Edit
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
