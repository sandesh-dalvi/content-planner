# Current Feature

## Status

Not Started

## Goals

<!-- Add feature goals here -->

## Notes

<!-- Add feature notes here -->

## History

- **CORE UI, LAYOUT & THEME**: Implemented the core violet theme, installed shadcn components, set up next-themes and a working theme toggle, configured the official shadcn sidebar with mobile auto-closing, built the dashboard layout with JIT workspace handling, and added placeholder pages for all routes.
- **POST MANAGEMENT (CRUD)**: Added validated create, edit, and delete Server Actions; a Tiptap post form; direct Vercel Blob image uploads; filtered post listing; protected Server Component pages; TanStack Query providers; confirmation-driven deletion; and unit coverage for post actions.
- **KANBAN BOARD**: Added a five-column drag-and-drop board with Server Component data loading, React 19 optimistic updates, DnD Kit pointer and keyboard sensors, droppable empty columns, drag overlays, persisted status changes, and rollback feedback on failure.
- **CALENDAR VIEW**: Installed react-big-calendar dependency; created getCalendarPosts() query for scheduled posts only; implemented calendar page as Server Component; built CalendarView client with localizer, drag-and-drop HOC, event styling, view switching; overridden react-big-calendar CSS to match violet theme; implemented onSelectSlot (click-to-create) and onEventDrop/onSelectEvent handlers using useOptimistic; updated NewPostPage and PostForm to accept pre-filled scheduledFor.
