// src/app/(dashboard)/posts/new/page.tsx — updated
import { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { PostForm } from "@/components/posts/post-form";

export const metadata: Metadata = { title: "Create Post" };

interface NewPostPageProps {
  searchParams: { status?: string; scheduledFor?: string };
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

  // Status from Kanban "+" button
  const defaultStatus = VALID_STATUSES.includes(searchParams.status ?? "")
    ? (searchParams.status as
        | "DRAFT"
        | "IN_REVIEW"
        | "APPROVED"
        | "SCHEDULED"
        | "PUBLISHED")
    : "DRAFT";

  // scheduledFor from calendar date click
  // The value is a datetime-local string: "2026-07-20T10:00"
  const defaultScheduledFor = searchParams.scheduledFor ?? undefined;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Create Post</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Write and schedule your social media content
        </p>
      </div>
      <PostForm
        defaultStatus={defaultStatus}
        defaultScheduledFor={defaultScheduledFor}
      />
    </div>
  );
}
