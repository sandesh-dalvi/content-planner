// src/app/(dashboard)/posts/new/page.tsx
import { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { PostForm } from "@/components/posts/post-form";

export const metadata: Metadata = { title: "Create Post" };

export default async function NewPostPage() {
  // Defense-in-depth — layout already checks but we confirm again
  await requireAuth();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Create Post</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Write and schedule your social media content
        </p>
      </div>
      <PostForm />
    </div>
  );
}
