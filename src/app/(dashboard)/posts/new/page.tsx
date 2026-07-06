// src/app/(dashboard)/posts/new/page.tsx — updated
import { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { PostForm } from "@/components/posts/post-form";

export const metadata: Metadata = { title: "Create Post" };

interface NewPostPageProps {
  searchParams: { status?: string };
}

const VALID_STATUSES = [
  "DRAFT",
  "IN_REVIEW",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
];

export default async function NewPostPage({ searchParams }: NewPostPageProps) {
  await requireAuth();

  // Pre-select the status if a valid one was passed from Kanban
  const preselectedStatus =
    searchParams.status && VALID_STATUSES.includes(searchParams.status)
      ? searchParams.status
      : "DRAFT";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Create Post</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Write and schedule your social media content
        </p>
      </div>
      <PostForm defaultStatus={preselectedStatus as any} />
    </div>
  );
}
