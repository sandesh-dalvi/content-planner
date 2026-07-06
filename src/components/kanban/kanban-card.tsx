"use client";

import { cn } from "@/lib/utils";
import type { KanbanPost } from "@/types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { KanbanCardContent } from "./kanban-card-content";

interface KanbanCardProps {
  post: KanbanPost;
}

export function KanbanCard({ post }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: post.id,
      // Carry the full post in the drag data — the board's onDragStart reads this to render the correct card in DragOverlay without having to search through the post array by id
      data: { post },
    });

  return (
    <div
      ref={setNodeRef} // CSS.Transform.toString produces the correct translate3d string.
      // During drag, the card moves with the cursor via the transform.
      style={{ transform: CSS.Transform.toString(transform) }}
      className={cn(
        "cursor-grab select-none active:cursor-grabbing",
        // While this card is the one being dragged, make it transparent.
        // The DragOverlay renders the visible ghost at full opacity.
        isDragging && "opacity-0",
      )}
      {...listeners}
      {...attributes}
    >
      <KanbanCardContent post={post} />
    </div>
  );
}
