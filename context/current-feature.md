# Calendar View

## Status

In Progress

## Goals

- Install missing type dependency for react-big-calendar
- Create dedicated calendar query fetching only posts with scheduled dates
- Implement the calendar page as a Server Component
- Build CalendarView client component with localizer, drag-and-drop HOC, event styling, and view switching
- Override react-big-calendar's default CSS to match the violet theme
- Implement onSelectSlot for click-to-create (navigate to new post with pre-filled date)
- Implement onEventDrop for drag-to-reschedule using useOptimistic
- Implement onSelectEvent for click-to-edit events
- Update NewPostPage and PostForm to accept pre-filled scheduledFor from calendar

## History

- **CORE UI, LAYOUT & THEME**: Implemented the core violet theme, installed shadcn components, set up next-themes and a working theme toggle, configured the official shadcn sidebar with mobile auto-closing, built the dashboard layout with JIT workspace handling, and added placeholder pages for all routes.
- **POST MANAGEMENT (CRUD)**: Added validated create, edit, and delete Server Actions; a Tiptap post form; direct Vercel Blob image uploads; filtered post listing; protected Server Component pages; TanStack Query providers; confirmation-driven deletion; and unit coverage for post actions.
- **KANBAN BOARD**: Added a five-column drag-and-drop board with Server Component data loading, React 19 optimistic updates, DnD Kit pointer and keyboard sensors, droppable empty columns, drag overlays, persisted status changes, and rollback feedback on failure.
