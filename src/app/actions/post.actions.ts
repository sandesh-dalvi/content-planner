// src/app/actions/post.actions.ts
"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import {
  createPostSchema,
  updatePostSchema,
  updateStatusSchema,
} from "@/validaions/post.validation";
import type {
  CreatePostInput,
  UpdatePostInput,
  UpdateStatusInput,
} from "@/validaions/post.validation";
import { getWorkspaceByUserId } from "@/db/queries/workspace.queries";

async function getAuthorizedWorkspace(userId: string) {
  const workspace = await getWorkspaceByUserId(userId);
  if (!workspace) throw new Error("Workspace not found");
  return workspace;
}

export async function createPost(input: CreatePostInput) {
  const { userId } = await requireAuth();
  const workspace = await getAuthorizedWorkspace(userId);

  const result = createPostSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false as const,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const data = result.data;

  // Sanitize the content field before passing to Prisma.
  // Zod's safeParse creates a new object but does not strip
  // Symbol descriptors from nested values. This ensures Prisma
  // always receives a pure JSON-serializable value for the JSONB column.
  const safeContent = JSON.parse(
    JSON.stringify(data.content),
  ) as Prisma.InputJsonValue;

  const post = await prisma.post.create({
    data: {
      workspaceId: workspace.id,
      userId,
      title: data.title,
      content: safeContent,
      platform: data.platform,
      status: data.status,
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
    },
  });

  revalidatePath("/posts/kanban");
  revalidatePath("/posts");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");

  return { success: true as const, postId: post.id };
}

export async function updatePost(postId: string, input: UpdatePostInput) {
  const { userId } = await requireAuth();
  const workspace = await getAuthorizedWorkspace(userId);

  const existingPost = await prisma.post.findUnique({
    where: { id: postId, workspaceId: workspace.id },
    select: { id: true },
  });

  if (!existingPost) {
    return { success: false as const, errors: { root: ["Post not found"] } };
  }

  const result = updatePostSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false as const,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const data = result.data;

  await prisma.post.update({
    where: { id: postId, workspaceId: workspace.id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.platform !== undefined && { platform: data.platform }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.content !== undefined && {
        // Same sanitization for updates
        content: JSON.parse(
          JSON.stringify(data.content),
        ) as Prisma.InputJsonValue,
      }),
      ...(data.scheduledFor !== undefined && {
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
      }),
      updatedAt: new Date(),
    },
  });

  revalidatePath("/posts/kanban");
  revalidatePath("/posts");
  revalidatePath("/calendar");
  revalidatePath(`/posts/${postId}/edit`);
  revalidatePath("/dashboard");

  return { success: true as const };
}

export async function deletePost(postId: string) {
  const { userId } = await requireAuth();
  const workspace = await getAuthorizedWorkspace(userId);

  await prisma.post.delete({
    where: { id: postId, workspaceId: workspace.id },
  });

  revalidatePath("/posts/kanban");
  revalidatePath("/posts");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");

  redirect("/posts");
}

export async function updatePostStatus(input: UpdateStatusInput) {
  const { userId } = await requireAuth();
  const workspace = await getAuthorizedWorkspace(userId);

  const result = updateStatusSchema.safeParse(input);
  if (!result.success) return { success: false as const };

  try {
    await prisma.post.update({
      where: { id: result.data.postId, workspaceId: workspace.id },
      data: { status: result.data.status },
    });
  } catch {
    return { success: false as const };
  }

  revalidatePath("/posts/kanban");
  revalidatePath("/dashboard");

  return { success: true as const };
}
