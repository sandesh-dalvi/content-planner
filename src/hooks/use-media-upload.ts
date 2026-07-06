// src/hooks/use-media-upload.ts
"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface UploadedMedia {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  localPreview?: string; // Object URL for immediate display before server confirm
}

export function useMediaUpload() {
  const [uploads, setUploads] = useState<UploadedMedia[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsUploading(true);

    try {
      const results = await Promise.all(
        fileArray.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const err = (await res.json()) as { error: string };
            throw new Error(err.error ?? "Upload failed");
          }

          const data = (await res.json()) as UploadedMedia;
          return data;
        }),
      );

      setUploads((prev) => [...prev, ...results]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const removeUpload = useCallback((url: string) => {
    setUploads((prev) => prev.filter((u) => u.url !== url));
  }, []);

  const resetUploads = useCallback(() => setUploads([]), []);

  return { uploads, isUploading, uploadFiles, removeUpload, resetUploads };
}
