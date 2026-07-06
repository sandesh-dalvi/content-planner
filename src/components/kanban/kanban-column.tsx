"use client";

import { STATUS_COLORS } from "@/lib/kanban-config";
import type { KanbanPost, KanbanColumn as KanbanColumnType } from "@/types";
import { useDroppable } from "@dnd-kit/core";
import { Button } from "../ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { KanbanCard } from "./kanban-card";

interface KanbanColumnProps {
  column: KanbanColumnType;
  posts: KanbanPost[];
}

export function KanbanColumn({ column, posts }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    // Pass the column type in data so the onDragOver handler
    // can distinguish a "column" drop from a "card" drop
    data: { type: "column", status: column.id },
  });

  return (
    <div className=" flex w-72 shrink-0 flex-col rounded-xl border border-border bg-muted/30">
      <div className=" flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <span
            className=" h-2 w-2 rounded-full"
            style={{ backgroundColor: STATUS_COLORS[column.id] }}
          />

          <span className=" text-sm font-medium">{column.label}</span>

          <span className=" rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {posts.length}
          </span>
        </div>

        {/* Quick create button — pre-selects this column's status */}
        <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
          <Link
            href={`/posts/new?status=${column.id}`}
            aria-label={`New ${column.label} post`}
          >
            <Plus className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Drop zone — the ref must be on the scrollable area
          so the entire column height is a valid drop target */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-50 flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3",
          "transition-colors duration-150",
          // Highlight the column when a card is dragged over it
          isOver && "bg-primary/5 ring-1 ring-inset ring-primary/20",
        )}
      >
        {posts.map((post) => (
          <KanbanCard key={post.id} post={post} />
        ))}

        {/* Empty column placeholder — gives a visual drop target
            when the column has no cards */}
        {posts.length === 0 && !isOver && (
          <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-border p-4">
            <p className="text-center text-xs text-muted-foreground">
              Drop posts here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
