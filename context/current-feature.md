# Current Feature: Kanban Board

## Status

In Progress

## Goals

- Select and document the DnD Kit package version, including why its legacy stable API is appropriate.
- Fetch Kanban data in a Server Component and render the board through a Client Component with optimistic state.
- Use React 19 `useOptimistic` to move cards immediately while status updates persist through a Server Action.
- Configure `DndContext` with appropriate sensors, collision detection, and mobile pointer/touch support.
- Build droppable status columns with clear hover feedback, including reliable empty-column drop targets.
- Build draggable post cards with correct transform behavior and a `DragOverlay` ghost card.
- Connect drag completion to the existing `updatePostStatus` Server Action.
- Recover the visual board state and show user-friendly feedback when a status update fails.

## Notes

- The page must remain a Server Component; DnD behavior belongs in focused Client Components.
- The board must provide instant visual feedback while preserving the server as the source of truth.
- All five post statuses must remain valid drop targets even when their columns contain no cards.
- Pointer-based sensors must support both desktop and mobile interaction.

## History

- **CORE UI, LAYOUT & THEME**: Implemented the core violet theme, installed shadcn components, set up next-themes and a working theme toggle, configured the official shadcn sidebar with mobile auto-closing, built the dashboard layout with JIT workspace handling, and added placeholder pages for all routes.
- **POST MANAGEMENT (CRUD)**: Added validated create, edit, and delete Server Actions; a Tiptap post form; direct Vercel Blob image uploads; filtered post listing; protected Server Component pages; TanStack Query providers; confirmation-driven deletion; and unit coverage for post actions.
