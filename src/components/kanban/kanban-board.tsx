"use client";

import { useOptimistic, useState, useTransition } from "react";
import type { PostStatus } from "@/generated/prisma/enums";
import type { KanbanPost } from "@/types";

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KANBAN_COLUMNS } from "@/lib/kanban-config";
import { toast } from "sonner";
import { KanbanColumn } from "./kanban-column";
import { KanbanCardContent } from "./kanban-card-content";
import { updatePostStatus } from "@/app/actions/post.actions";

interface KanbanBoardProps {
  initialPosts: KanbanPost[];
}

export function KanbanBoard({ initialPosts }: KanbanBoardProps) {
  // useOptimistic gives us a version of posts that can be updated instantly on drag, before the Server Action confirms.
  // When the Server Action resolves and Next.js revalidates the page, optimisticPosts snaps back to the server-confirmed state.
  const [optimisticPosts, applyOptimisticUpdate] = useOptimistic(
    initialPosts,
    (
      currentPosts: KanbanPost[],
      update: { postId: string; status: PostStatus },
    ) =>
      currentPosts.map((post) =>
        post.id === update.postId ? { ...post, status: update.status } : post,
      ),
  );

  // Track the post being dragged — used to render the DragOverlay
  const [activePost, setActivePost] = useState<KanbanPost | null>(null);

  // useTransition wraps the Server Action call so React can mark it as non-urgent and batch it with the optimistic update
  const [_, startTransition] = useTransition();

  // Sensors — PointerSensor handles mouse AND touch.
  // activationConstraint: distance 8px prevents firing on a click.
  // KeyboardSensor with sortableKeyboardCoordinates enables full keyboard navigation (Tab, Arrow, Space, Escape).
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 0 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    // The card passes its full post object in data so we don't need to search through the array
    const post = event.active.data.current?.post as KanbanPost | undefined;
    setActivePost(post ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActivePost(null);

    // If dropped outside any droppable, do nothing
    if (!over) return;

    const postId = active.id as string;
    const targetStatus = over.id as PostStatus;

    // Find the post's current status from the optimistic state
    const currentPost = optimisticPosts.find((post) => post.id === postId);

    // If dropped on same column or post not found, do nothing
    if (!currentPost || currentPost.status === targetStatus) return;

    // Validate targetStatus is actually a known column id
    const isValidStatus = KANBAN_COLUMNS.some(
      (column) => column.id === targetStatus,
    );
    if (!isValidStatus) return;

    startTransition(async () => {
      // 1. Apply optimistic update immediately — UI moves instantly
      applyOptimisticUpdate({ postId, status: targetStatus });

      // 2. Persist to database via Server Action
      const result = await updatePostStatus({ postId, status: targetStatus });

      // 3. If the Server Action fails, the optimistic update is
      //    automatically reverted when the transition ends because
      //    useOptimistic rolls back to the original `initialPosts`.
      //    Show a toast so the user knows the move was reverted.
      if (!result.success) {
        toast.error("Failed to move post. Please try again.");
      }
    });
  }

  function handleDragCancel() {
    setActivePost(null);
  }

  return (
    <DndContext
      sensors={sensors}
      // closestCorners is the recommended collision strategy for Kanban.
      // It measures the corners of both the draggable and droppable,
      // which handles the common case of dragging a narrow card
      // into a wide column header area correctly.
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      // Screen reader announcements — built-in accessibility
      accessibility={{
        announcements: {
          onDragStart: ({ active }) =>
            `Picked up post. Press Space to drop or Escape to cancel.`,
          onDragOver: ({ active, over }) =>
            over
              ? `Post over ${over.id.toString().replace("_", " ")} column.`
              : "Post is not over a column.",
          onDragEnd: ({ active, over }) =>
            over
              ? `Post moved to ${over.id.toString().replace("_", " ")}.`
              : "Post dropped with no changes.",
          onDragCancel: () => "Drag cancelled.",
        },
      }}
    >
      {/* Board layout — horizontal scroll when columns don't fit */}
      <div className=" flex h-full gap-4 pb-4">
        {KANBAN_COLUMNS.map((column) => {
          const columnPosts = optimisticPosts.filter(
            (p) => p.status === column.id,
          );
          return (
            <KanbanColumn key={column.id} column={column} posts={columnPosts} />
          );
        })}
      </div>
      {/* DragOverlay — renders at the viewport level (not inside any column).
          Uses KanbanCardContent (no hooks) to show the card visual.
          isOverlay adds a rotation + ring to indicate it's being dragged. */}
      <DragOverlay
        // Smooth return animation when the card is dropped
        dropAnimation={{
          duration: 200,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}
      >
        {activePost ? (
          <div className="w-72">
            <KanbanCardContent post={activePost} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
