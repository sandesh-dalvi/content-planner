// src/components/posts/post-form.tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createPostSchema,
  PLATFORM_LIMITS,
} from "@/validaions/post.validation";
import type { CreatePostInput } from "@/validaions/post.validation";
import { createPost, updatePost } from "@/app/actions/post.actions";
import { RichEditor } from "./rich-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMediaUpload } from "@/hooks/use-media-upload";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Post, Media } from "@/generated/prisma/client";
import type { TipTapContent } from "@/types";

// Platform display config — single source of truth
const PLATFORM_CONFIG = {
  INSTAGRAM: { label: "Instagram", emoji: "📸" },
  LINKEDIN: { label: "LinkedIn", emoji: "💼" },
  TWITTER: { label: "Twitter/X", emoji: "🐦" },
  FACEBOOK: { label: "Facebook", emoji: "📘" },
  TIKTOK: { label: "TikTok", emoji: "🎵" },
  YOUTUBE: { label: "YouTube", emoji: "▶️" },
} as const;

const STATUS_CONFIG = {
  DRAFT: { label: "Draft" },
  IN_REVIEW: { label: "In Review" },
  APPROVED: { label: "Approved" },
  SCHEDULED: { label: "Scheduled" },
  PUBLISHED: { label: "Published" },
} as const;

const DEFAULT_CONTENT: TipTapContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

interface PostFormProps {
  // When provided, form operates in edit mode
  post?: Post & { media: Media[] };
}

export function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const isEditing = !!post;
  const { uploads, isUploading, uploadFiles, removeUpload } = useMediaUpload();

  // Initialize with existing post data in edit mode
  const defaultScheduledFor = post?.scheduledFor
    ? format(new Date(post.scheduledFor), "yyyy-MM-dd'T'HH:mm")
    : "";

  const form = useForm<CreatePostInput>({
    resolver: standardSchemaResolver(createPostSchema),
    defaultValues: {
      title: post?.title ?? "",
      // Cast through TipTapContent — not through `object` which TypeScript widens to `{}`
      content: (post?.content as TipTapContent | undefined) ?? DEFAULT_CONTENT,
      platform: (post?.platform as CreatePostInput["platform"]) ?? "INSTAGRAM",
      status: (post?.status as CreatePostInput["status"]) ?? "DRAFT",
      scheduledFor: defaultScheduledFor || undefined,
    },
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const selectedPlatform = watch("platform");
  const charLimit = selectedPlatform
    ? PLATFORM_LIMITS[selectedPlatform]
    : undefined;

  async function onSubmit(data: CreatePostInput) {
    // TipTap's getJSON() returns ProseMirror-derived objects that retain
    // internal Symbol properties. React 19's Flight protocol cannot serialize
    // these cleanly and marks the value as a client reference on the server.
    // JSON.parse(JSON.stringify()) strips every non-enumerable property,
    // Symbol, and prototype reference — leaving a pure plain object
    // that React Flight serializes without issues.
    const payload: CreatePostInput = {
      ...data,
      content: data.content,
    };

    const result = isEditing
      ? await updatePost(post.id, payload)
      : await createPost(payload);

    if (!result.success) {
      toast.error(
        isEditing ? "Failed to update post" : "Failed to create post",
      );
      return;
    }

    toast.success(isEditing ? "Post updated" : "Post created");
    router.push("/posts/kanban");
  }

  function handleFileDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) uploadFiles(files);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Post title..."
          aria-invalid={!!errors.title}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Platform + Status row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>
            Platform <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="platform"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger aria-invalid={!!errors.platform}>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PLATFORM_CONFIG).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.emoji} {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.platform && (
            <p className="text-sm text-destructive">
              {errors.platform.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Rich text content */}
      <div className="space-y-2">
        <Label>
          Content <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <RichEditor
              value={field.value} // No cast — field.value is already TipTapContent
              onChange={field.onChange} // No cast — RichEditor.onChange matches field.onChange
              characterLimit={charLimit}
              placeholder={`Write your ${selectedPlatform?.toLowerCase() ?? "post"} content...`}
            />
          )}
        />
        {errors.content && (
          <p className="text-sm text-destructive">
            {errors.content.message as string}
          </p>
        )}
      </div>

      {/* Scheduled date */}
      <div className="space-y-2">
        <Label htmlFor="scheduledFor">Schedule Date & Time</Label>
        <Input
          id="scheduledFor"
          type="datetime-local"
          {...register("scheduledFor")}
        />
        <p className="text-xs text-muted-foreground">
          Leave blank to save without scheduling
        </p>
      </div>

      {/* Media upload */}
      <div className="space-y-2">
        <Label>Images</Label>

        {/* Drop zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center",
            "rounded-lg border-2 border-dashed border-input",
            "px-6 py-8 text-center transition-colors",
            "hover:border-primary hover:bg-primary/5",
          )}
          onClick={() => document.getElementById("file-upload")?.click()}
          role="button"
          aria-label="Upload images"
        >
          <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            {isUploading
              ? "Uploading..."
              : "Drop images here or click to upload"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PNG, JPG, WEBP, GIF — max 4MB each
          </p>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          />
        </div>

        {/* Existing media (edit mode) */}
        {post?.media && post.media.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {post.media.map((m) => (
              <div key={m.id} className="group relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.url}
                  alt={m.filename}
                  className="h-full w-full rounded-md object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* New uploads preview */}
        {uploads.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {uploads.map((upload) => (
              <div key={upload.url} className="group relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={upload.url}
                  alt={upload.filename}
                  className="h-full w-full rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeUpload(upload.url)}
                  className={cn(
                    "absolute right-1 top-1 rounded-full",
                    "bg-destructive p-0.5 text-destructive-foreground",
                    "opacity-0 transition-opacity group-hover:opacity-100",
                  )}
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update Post" : "Create Post"}
        </Button>
      </div>
    </form>
  );
}
