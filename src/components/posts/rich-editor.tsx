// src/components/posts/rich-editor.tsx
"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TipTapContent } from "@/types";

interface RichEditorProps {
  // Typed as TipTapContent — no more `object` which TypeScript reads as `{}`
  value?: TipTapContent;
  onChange?: (json: TipTapContent) => void;
  placeholder?: string;
  characterLimit?: number;
  className?: string;
}
export function RichEditor({
  value,
  onChange,
  placeholder = "Write your post content here...",
  characterLimit,
  className,
}: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        code: false,
        codeBlock: false,
        // Do NOT set undoRedo: true — enabled by default, true is invalid type
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-primary underline underline-offset-4 hover:text-primary/80",
        },
      }),
      Placeholder.configure({ placeholder }),
      ...(characterLimit
        ? [CharacterCount.configure({ limit: characterLimit })]
        : []),
    ],
    content: value ?? { type: "doc", content: [{ type: "paragraph" }] },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // editor.getJSON() returns an object that satisfies TipTapContent —
      // cast is safe because TipTap always produces { type: string, ... }
      onChange?.(editor.getJSON() as TipTapContent);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none min-h-[180px] px-4 py-3",
          "focus:outline-none",
          "dark:prose-invert",
        ),
      },
    },
  });

  // Sync external value changes (e.g., when loading existing post for edit)
  useEffect(() => {
    if (!editor || !value) return;
    const currentJSON = JSON.stringify(editor.getJSON());
    const incomingJSON = JSON.stringify(value);
    if (currentJSON !== incomingJSON) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) return null;

  const characterCount = editor.storage.characterCount?.characters?.() ?? 0;

  return (
    <div
      className={cn(
        "rounded-lg border border-input bg-background",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-input px-2 py-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-active={editor.isActive("bold")}
          aria-label="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          data-active={editor.isActive("italic")}
          aria-label="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          data-active={editor.isActive("bulletList")}
          aria-label="Bullet list"
        >
          <List className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          data-active={editor.isActive("orderedList")}
          aria-label="Ordered list"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            const url = window.prompt("Enter link URL:");
            if (!url) return;
            editor.chain().focus().setLink({ href: url }).run();
          }}
          data-active={editor.isActive("link")}
          aria-label="Add link"
        >
          <Link2 className="h-3.5 w-3.5" />
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          aria-label="Undo"
        >
          <Undo className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          aria-label="Redo"
        >
          <Redo className="h-3.5 w-3.5" />
        </Button>

        {characterLimit && (
          <span
            className={cn(
              "ml-auto text-xs text-muted-foreground tabular-nums",
              characterCount > characterLimit * 0.9 && "text-warning",
              characterCount >= characterLimit && "text-destructive",
            )}
          >
            {characterCount} / {characterLimit}
          </span>
        )}
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
