// src/app/(dashboard)/posts/[id]/edit/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getPostById } from "@/db/queries/posts.queries";
import { getWorkspaceByUserId } from "@/db/queries/workspace.queries";
import { PostForm } from "@/components/posts/post-form";

export const metadata: Metadata = { title: "Edit Post" };

// In Next.js 15+, params is a Promise
interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const { userId } = await requireAuth();
  const workspace = await getWorkspaceByUserId(userId);

  if (!workspace) notFound();

  const post = await getPostById(id, workspace.id);

  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Post</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your post before publishing
        </p>
      </div>
      <PostForm post={post} />
    </div>
  );
}
