import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  getWorkspaceByUserId: vi.fn(),
  create: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth", () => ({ requireAuth: mocks.requireAuth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    post: {
      create: mocks.create,
      findUnique: mocks.findUnique,
      update: mocks.update,
      delete: mocks.delete,
    },
  },
}));
vi.mock("@/db/queries/workspace.queries", () => ({
  getWorkspaceByUserId: mocks.getWorkspaceByUserId,
}));

import {
  createPost,
  deletePost,
  updatePost,
  updatePostStatus,
} from "./post.actions";

const validPost = {
  title: "Launch post",
  content: { type: "doc", content: [] },
  platform: "LINKEDIN" as const,
  status: "DRAFT" as const,
  scheduledFor: null,
};

describe("post actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.getWorkspaceByUserId.mockResolvedValue({ id: "workspace-1" });
  });

  describe("createPost", () => {
    it("creates a workspace-scoped post and revalidates affected pages", async () => {
      mocks.create.mockResolvedValue({ id: "post-1" });

      await expect(createPost(validPost)).resolves.toEqual({
        success: true,
        postId: "post-1",
      });
      expect(mocks.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          workspaceId: "workspace-1",
          userId: "user-1",
          title: "Launch post",
        }),
      });
      expect(mocks.revalidatePath).toHaveBeenCalledWith("/posts");
    });

    it("creates a post with media and stores media in database", async () => {
      mocks.create.mockResolvedValue({ id: "post-1" });

      const postWithMedia = {
        ...validPost,
        media: [
          {
            url: "https://example.com/image.png",
            filename: "image.png",
            mimeType: "image/png",
            size: 1024,
          },
        ],
      };

      await expect(createPost(postWithMedia)).resolves.toEqual({
        success: true,
        postId: "post-1",
      });

      expect(mocks.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          workspaceId: "workspace-1",
          userId: "user-1",
          title: "Launch post",
          media: {
            createMany: {
              data: [
                expect.objectContaining({
                  url: "https://example.com/image.png",
                  filename: "image.png",
                  mimeType: "image/png",
                  size: 1024,
                }),
              ],
            },
          },
        }),
      });
    });

    it("returns validation errors without writing to the database", async () => {
      const result = await createPost({ ...validPost, title: "" });

      expect(result).toEqual({
        success: false,
        errors: expect.objectContaining({ title: ["Title is required"] }),
      });
      expect(mocks.create).not.toHaveBeenCalled();
    });

    it("rejects users without a workspace", async () => {
      mocks.getWorkspaceByUserId.mockResolvedValue(null);

      await expect(createPost(validPost)).rejects.toThrow("Workspace not found");
      expect(mocks.create).not.toHaveBeenCalled();
    });
  });

  describe("updatePost", () => {
    it("updates only an existing post in the authenticated workspace", async () => {
      mocks.findUnique.mockResolvedValue({ id: "post-1" });

      await expect(
        updatePost("post-1", { title: "Updated title" }),
      ).resolves.toEqual({ success: true });
      expect(mocks.findUnique).toHaveBeenCalledWith({
        where: { id: "post-1", workspaceId: "workspace-1" },
        select: { id: true },
      });
      expect(mocks.update).toHaveBeenCalledWith({
        where: { id: "post-1", workspaceId: "workspace-1" },
        data: expect.objectContaining({ title: "Updated title" }),
      });
    });

    it("updates post media when media is provided", async () => {
      mocks.findUnique.mockResolvedValue({ id: "post-1" });

      const updateData = {
        title: "Updated title",
        media: [
          {
            url: "https://example.com/new-image.png",
            filename: "new-image.png",
            mimeType: "image/png",
            size: 2048,
          },
        ],
      };

      await expect(updatePost("post-1", updateData)).resolves.toEqual({
        success: true,
      });

      expect(mocks.update).toHaveBeenCalledWith({
        where: { id: "post-1", workspaceId: "workspace-1" },
        data: expect.objectContaining({
          title: "Updated title",
          media: {
            createMany: {
              data: [
                expect.objectContaining({
                  url: "https://example.com/new-image.png",
                  filename: "new-image.png",
                  mimeType: "image/png",
                  size: 2048,
                }),
              ],
            },
          },
        }),
      });
    });

    it("does not update a post outside the workspace", async () => {
      mocks.findUnique.mockResolvedValue(null);

      await expect(updatePost("post-2", validPost)).resolves.toEqual({
        success: false,
        errors: { root: ["Post not found"] },
      });
      expect(mocks.update).not.toHaveBeenCalled();
    });

    it("returns validation errors before updating", async () => {
      mocks.findUnique.mockResolvedValue({ id: "post-1" });

      const result = await updatePost("post-1", { title: "x".repeat(201) });

      expect(result).toEqual({
        success: false,
        errors: expect.objectContaining({
          title: ["Title cannot exceed 200 characters"],
        }),
      });
      expect(mocks.update).not.toHaveBeenCalled();
    });
  });

  describe("deletePost", () => {
    it("deletes within the workspace and redirects to the post list", async () => {
      await deletePost("post-1");

      expect(mocks.delete).toHaveBeenCalledWith({
        where: { id: "post-1", workspaceId: "workspace-1" },
      });
      expect(mocks.redirect).toHaveBeenCalledWith("/posts");
    });
  });

  describe("updatePostStatus", () => {
    it("updates a valid status within the workspace", async () => {
      await expect(
        updatePostStatus({ postId: "post-1", status: "APPROVED" }),
      ).resolves.toEqual({ success: true });
      expect(mocks.update).toHaveBeenCalledWith({
        where: { id: "post-1", workspaceId: "workspace-1" },
        data: { status: "APPROVED" },
      });
    });

    it("rejects invalid input without updating", async () => {
      const result = await updatePostStatus({
        postId: "",
        status: "APPROVED",
      });

      expect(result).toEqual({ success: false });
      expect(mocks.update).not.toHaveBeenCalled();
    });

    it("returns failure when the status update cannot be persisted", async () => {
      mocks.update.mockRejectedValue(new Error("Database unavailable"));

      await expect(
        updatePostStatus({ postId: "post-1", status: "APPROVED" }),
      ).resolves.toEqual({ success: false });
      expect(mocks.revalidatePath).not.toHaveBeenCalled();
    });
  });
});
