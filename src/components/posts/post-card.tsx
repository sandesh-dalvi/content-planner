// src/components/posts/post-card.tsx
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { Calendar, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeletePostButton } from "./delete-post-button";
import { cn } from "@/lib/utils";
import type { Post, Media } from "@/generated/prisma/client";

// Status styles using the CSS variables established in globals.css
const STATUS_STYLES = {
  DRAFT: "bg-muted text-muted-foreground",
  IN_REVIEW: "bg-warning/10 text-warning border-warning/20",
  APPROVED: "bg-success/10 text-success border-success/20",
  SCHEDULED: "bg-info/10 text-info border-info/20",
  PUBLISHED: "bg-primary/10 text-primary border-primary/20",
} as const;

const PLATFORM_EMOJI = {
  INSTAGRAM: "📸",
  LINKEDIN: "💼",
  TWITTER: "🐦",
  FACEBOOK: "📘",
  TIKTOK: "🎵",
  YOUTUBE: "▶️",
} as const;

interface PostCardProps {
  post: Post & { media: Pick<Media, "url" | "mimeType">[] };
}

export function PostCard({ post }: PostCardProps) {
  const firstImage = post.media[0];

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      {/* Image thumbnail if present */}
      {firstImage && (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={firstImage.url}
            alt="Post image"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          {post.media.length > 1 && (
            <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
              +{post.media.length - 1}
            </span>
          )}
        </div>
      )}

      <CardContent className="p-4">
        {/* Platform + Status */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {PLATFORM_EMOJI[post.platform]} {post.platform}
          </span>
          <Badge
            variant="outline"
            className={cn("text-xs", STATUS_STYLES[post.status])}
          >
            {post.status.replace("_", " ")}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 font-semibold leading-snug text-foreground">
          {post.title}
        </h3>

        {/* Scheduled date */}
        {post.scheduledFor && (
          <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {format(new Date(post.scheduledFor), "MMM d, yyyy")} at{" "}
              {format(new Date(post.scheduledFor), "h:mm a")}
            </span>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
              <Link href={`/posts/${post.id}/edit`} aria-label="Edit post">
                <Edit className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <DeletePostButton postId={post.id} postTitle={post.title} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
