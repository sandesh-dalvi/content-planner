# Current Feature: Post Management (CRUD)

## Status

In Progress

## Goals

- Install all required packages (Tiptap, React Hook Form, Zod, TanStack Query v5, Vercel Blob)
- Define a single Zod validation schema as the source of truth for form + server action validation
- Implement Server Actions: `createPost`, `updatePost`, `deletePost` — with auth guard on every action
- Build the Tiptap rich text editor as a Client Component with a custom toolbar
- Build the post form using React Hook Form + Zod + `useTransition` for pending/loading state
- Implement image upload via Vercel Blob client-upload pattern (to bypass the 4.5 MB serverless limit)
- Create `posts/new/page.tsx` and `posts/[id]/edit/page.tsx` as pure Server Components
- Create `posts/page.tsx` — list view with working status and platform filters
- Wire TanStack Query v5 into `Providers` for Client Component mutation hooks
- Add `delete-post-button.tsx` with a confirm dialog

## Notes

- All pages (`posts/page.tsx`, `posts/new/page.tsx`, `posts/[id]/edit/page.tsx`) must remain **Server Components** — only the editor, form, and delete button are Client Components.
- Image upload uses the **Vercel Blob client-upload** pattern to avoid the 4.5 MB limit imposed by serverless functions.
- Zod schema is the **single source of truth** — shared between the form validation (client) and server actions (server).
- TanStack Query v5 is wired into `Providers` for any mutation hooks used in Client Components.

## History

- **CORE UI, LAYOUT & THEME**: Implemented the core violet theme, installed shadcn components, set up next-themes and a working theme toggle, configured the official shadcn sidebar with mobile auto-closing, built the dashboard layout with JIT workspace handling, and added placeholder pages for all routes.
