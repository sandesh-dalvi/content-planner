// src/app/(dashboard)/posts/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { getWorkspaceByUserId } from "@/db/queries/workspace.queries";
import { getPostsByWorkspace } from "@/db/queries/posts.queries";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/posts/post-card";
import { PostsEmptyState } from "@/components/posts/posts-empty-state";
import { notFound } from "next/navigation";
import type { Platform, PostStatus } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Posts" };

// In Next.js 15+, searchParams is a Promise
interface PostsPageProps {
  searchParams: Promise<{
    platform?: string;
    status?: string;
  }>;
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const { platform, status } = await searchParams;
  const { userId } = await requireAuth();
  const workspace = await getWorkspaceByUserId(userId);

  if (!workspace) notFound();

  // Build filters from URL search params — validated before passing to Prisma
  const validPlatforms = [
    "INSTAGRAM",
    "LINKEDIN",
    "TWITTER",
    "FACEBOOK",
    "TIKTOK",
    "YOUTUBE",
  ];
  const validStatuses = [
    "DRAFT",
    "IN_REVIEW",
    "APPROVED",
    "SCHEDULED",
    "PUBLISHED",
  ];

  const filters = {
    platform: validPlatforms.includes(platform ?? "")
      ? (platform as Platform)
      : undefined,
    status: validStatuses.includes(status ?? "")
      ? (status as PostStatus)
      : undefined,
  };

  const posts = await getPostsByWorkspace(workspace.id, filters);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {posts.length} post{posts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <PostsEmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
