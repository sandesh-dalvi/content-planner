# CONTENT PLANNER — PROJECT CONTEXT (AI AGENT REFERENCE)

## PROJECT OVERVIEW

A personal content planning SaaS built as a portfolio project.
Single-user per workspace (no teams in MVP). Manage social media
posts through a Kanban board and calendar. Stack is fully decided
and locked — do not suggest alternatives.

---

## TECH STACK (LOCKED — DO NOT CHANGE)

| Layer         | Technology                               | Version |
| ------------- | ---------------------------------------- | ------- |
| Framework     | Next.js (App Router)                     | 16.x    |
| Language      | TypeScript (strict mode)                 | 5.x     |
| Styling       | Tailwind CSS (CSS-first, no config file) | 4.x     |
| UI Components | shadcn/ui (Nova style)                   | latest  |
| Icons         | Lucide React                             | latest  |
| Auth          | Clerk                                    | v7.x    |
| ORM           | Prisma                                   | 7.x     |
| Database      | PostgreSQL via Neon (serverless)         | PG 16   |
| DB Adapter    | @prisma/adapter-pg + pg                  | latest  |
| File Storage  | Vercel Blob                              | latest  |
| Forms         | React Hook Form + Zod                    | RHF 7.x |
| Server State  | TanStack Query                           | v5.x    |
| Drag & Drop   | DnD Kit                                  | 6.x     |
| Calendar      | React Big Calendar + date-fns            | latest  |
| Rich Text     | Tiptap                                   | 2.x     |
| Charts        | Recharts                                 | latest  |
| Toasts        | Sonner                                   | latest  |
| Animations    | tw-animate-css                           | latest  |
| Deployment    | Vercel (app) + Neon (database)           | —       |

---

## CRITICAL ARCHITECTURE RULES

### Rendering Model — Non-Negotiable

1. Every `page.tsx` is a Server Component. NEVER add `'use client'` to a page.
2. Every `layout.tsx` is a Server Component. NEVER add `'use client'` to a layout.
3. `'use client'` goes ONLY on leaf interactive components that need:
   - useState / useEffect / useReducer
   - Event handlers (onClick, onChange, onSubmit)
   - Browser APIs
   - Third-party DOM libraries (DnD Kit, React Big Calendar, Recharts, Tiptap)
4. Data fetching happens INSIDE Server Components via direct Prisma calls
   or via functions from `src/db/queries/`. Never fetch in useEffect.
5. Mutations happen ONLY via Server Actions in `src/app/actions/`.
6. Never create an API route for something a Server Action can do.
   API routes are only for: webhooks, file uploads, external integrations.

### Security Rules

- Never access the database from a Client Component.
- All files in `src/db/queries/` and `src/lib/prisma.ts` start with
  `import 'server-only'` — this enforces the rule at build time.
- Every protected page calls `requireAuth()` from `src/lib/auth.ts`
  at the top, regardless of proxy.ts protection (defense in depth).
- Every database query is scoped to `workspaceId` or `userId`.
  Never query without a scope.

### Prisma 7 Rules (BREAKING CHANGES from v5/v6)

- The `datasource db` block in `schema.prisma` has NO `url` field.
  The URL lives in `prisma.config.ts` only.
- `generator client` MUST have `output = "../src/generated/prisma"`.
- Import Prisma types from `@/generated/prisma`, NOT `@prisma/client`.
- PrismaClient requires the PrismaPg driver adapter — see `src/lib/prisma.ts`.
- `DIRECT_URL` is used by Prisma CLI (migrations, seeds).
- `DATABASE_URL` (pooled) is used by the running application.
- NEVER run `prisma db push` — always use `prisma migrate dev`.

### Clerk v7 Rules (BREAKING CHANGES from v5)

- `auth()` is async — always `await auth()`.
- Use `isAuthenticated` to check login state, not `!!userId`.
- Route protection file is `src/proxy.ts` (not middleware.ts — Next.js 16 rename).
- Do NOT use `auth.protect()` in proxy.ts — known bug with Next.js 16
  proxy runtime. Use the manual redirect pattern instead.
- Clerk user ID is the primary key for `User` model in the database.

### TanStack Query v5 Rules

- All hook calls use single object signature: `useQuery({ queryKey, queryFn })`.
- `cacheTime` is renamed to `gcTime` in v5.
- Server Components do NOT use TanStack Query — they query directly.
- TanStack Query is only for Client Components that need reactive/cached
  server state after hydration.

---

## DATABASE SCHEMA (Prisma 7)

### Models

User
id String @id # Clerk user ID (not auto-generated)
email String @unique
name String?
image String?
createdAt DateTime
updatedAt DateTime
workspace Workspace? # One-to-one
posts Post[]Workspace
id String @id @default(cuid())
userId String @unique # Enforces one workspace per user
name String
slug String @unique
createdAt DateTime
updatedAt DateTime
user User @relation(Cascade)
posts Post[]Post
id String @id @default(cuid())
workspaceId String
userId String
title String
content Json @db.JsonB # TipTap editor JSON output
platform Platform (enum)
status PostStatus @default(DRAFT)
scheduledFor DateTime?
publishedAt DateTime?
createdAt DateTime
updatedAt DateTime
workspace Workspace @relation(Cascade)
user User @relation(Cascade)
media Media[]Media
id String @id @default(cuid())
postId String
url String # Vercel Blob CDN URL
filename String
mimeType String
size Int
width Int?
height Int?
uploadedAt DateTime
post Post @relation(Cascade)

### Enums

Platform: INSTAGRAM | LINKEDIN | TWITTER | FACEBOOK | TIKTOK | YOUTUBE
PostStatus: DRAFT | IN_REVIEW | APPROVED | SCHEDULED | PUBLISHED

### Key Indexes (already in schema)

- `[workspaceId, status]` — Kanban board queries
- `[workspaceId, scheduledFor]` — Calendar view queries
- `[workspaceId, createdAt]` — Post list view
- `[workspaceId, platform]` — Dashboard platform breakdown
- `[status, scheduledFor]` — Future scheduled job queries

---

## ENVIRONMENT VARIABLES

```bash
# Database — Neon PostgreSQL
DATABASE_URL="postgresql://..."         # Pooled — used by app at runtime
DIRECT_URL="postgresql://..."           # Unpooled — used by Prisma CLI only

# Authentication — Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
CLERK_WEBHOOK_SIGNING_SECRET=""
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# File Storage — Vercel Blob
BLOB_READ_WRITE_TOKEN=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## THEME & DESIGN SYSTEM

### Brand Color: Electric Violet

Primary (light): oklch(0.597 0.261 293.783) — violet-600 #7c3aed
Primary (dark): oklch(0.771 0.174 294.459) — violet-400

### Semantic Color Tokens (available as Tailwind utilities)

bg-primary / text-primary — violet brand
bg-success / text-success — emerald (approved, success toasts)
bg-warning / text-warning — amber (in review, warning toasts)
bg-info / text-info — blue (scheduled, info toasts)
bg-destructive / text-destructive — red (failed, delete, errors)

### Status Color Tokens (for Kanban columns, Badges, Calendar events)

--status-draft — gray
--status-review — amber
--status-approved — emerald
--status-scheduled — blue
--status-published — violet (matches brand)

### Platform Color Tokens (for Badge components)

--platform-instagram — #E1306C (rose-pink)
--platform-linkedin — #0A66C2 (blue)
--platform-twitter — #1DA1F2 (light blue)
--platform-facebook — #1877F2 (blue)
--platform-tiktok — black (light) / white (dark)
--platform-youtube — red

### Theme Mode

Light + Dark toggle via `next-themes`. Default: system preference.
Toggle is in the sidebar footer (`ThemeToggle` component).
Dark mode activated by `.dark` class on `<html>` element.

### shadcn/ui Style

Nova — tighter padding and reduced margins. Optimized for data-dense
interfaces (Kanban, Calendar, Dashboard). Previously called "New York".

---

## KEY PATTERNS — QUICK REFERENCE

### Protected Page Pattern

```typescript
// Every page under (dashboard)/ follows this pattern
import { requireAuth } from '@/lib/auth'
import { getPostsByWorkspace } from '@/db/queries/posts.queries'
import { getWorkspaceByUserId } from '@/db/queries/workspace.queries'

export default async function SomePage() {
  const { userId } = await requireAuth()
  const workspace = await getWorkspaceByUserId(userId)
  if (!workspace) redirect('/dashboard')
  const posts = await getPostsByWorkspace(workspace.id)
  return <SomeClientComponent initialData={posts} />
}
```

### Server Action Pattern

```typescript
// src/app/actions/post.actions.ts
"use server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPost(data: CreatePostInput) {
  const { userId } = await requireAuth();
  // validate, authorize, execute
  await prisma.post.create({ data: { ...data, userId } });
  revalidatePath("/posts/kanban");
}
```

### Zod Schema Pattern

```typescript
// src/validations/post.validations.ts
import { z } from "zod";
import { Platform, PostStatus } from "@/generated/prisma";

export const postSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.any(),
  platform: z.nativeEnum(Platform),
  status: z.nativeEnum(PostStatus),
  scheduledFor: z.date().optional(),
});
export type PostInput = z.infer<typeof postSchema>;
```

### Client Form with Server Action Pattern

```typescript
// 'use client' component
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createPost } from "@/app/actions/post.actions";
import { postSchema, type PostInput } from "@/validations/post.validations";

export function PostForm() {
  const form = useForm<PostInput>({ resolver: zodResolver(postSchema) });

  async function onSubmit(data: PostInput) {
    try {
      await createPost(data);
      toast.success("Post created");
    } catch {
      toast.error("Failed to create post");
    }
  }
  // ... render form
}
```

### TanStack Query v5 Pattern

```typescript
// Always single-object signature in v5
const { data } = useQuery({
  queryKey: ["posts", workspaceId, filters],
  queryFn: () => fetchPosts(workspaceId, filters),
  staleTime: 60_000,
});

const mutation = useMutation({
  mutationFn: updatePostStatus,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
});
```

---

## FILE NAMING CONVENTIONS

page.tsx — Next.js page (Server Component)
layout.tsx — Next.js layout (Server Component)
route.ts — Next.js API route handler
_.actions.ts — Server Actions ('use server')
_.queries.ts — Database read functions (server-only)
\*.validations.ts — Zod schemas
.types.ts — TypeScript types only (no runtime code)
use-.ts — Custom React hooks ('use client' implied)

---

## MVP FEATURE SCOPE

### ✅ IN SCOPE (build this)

- Authentication with Clerk (single account)
- Auto-created workspace on first login (one per user)
- Post CRUD — title, rich text content (Tiptap), platform, status, scheduled date
- Image upload to Vercel Blob, attached to posts
- Kanban board — 5 columns, drag-and-drop status changes (DnD Kit)
- Calendar view — month + week, click to create, drag to reschedule
- Basic dashboard — total posts, status breakdown chart, platform chart (Recharts)
- Dark mode toggle

### ❌ OUT OF SCOPE (do not build, do not suggest)

- Multiple workspaces per user
- Team members or invitations
- Comments on posts
- Tags on posts
- Activity feed
- Version history
- Content templates
- Recurring posts
- AI features
- Direct social media publishing (API integrations)
- Video upload

---

## WHAT'S ALREADY BUILT (Sections 1–4 Complete)

- Section 1: Next.js 16 project, TypeScript strict config, ESLint flat config,
  Prettier with Tailwind plugin, folder structure, environment variables, Git
- Section 2: Neon database, Prisma 7 with prisma.config.ts, schema with all
  4 models and indexes, first migration applied, PrismaPg singleton,
  server-only query functions, seed script
- Section 3: Clerk v7, src/proxy.ts route protection, sign-in/sign-up pages,
  requireAuth() / requireCurrentUser() guards, getOrCreateWorkspace() JIT
  provisioning, Clerk webhook for user sync (upsert pattern)
- Section 4: shadcn/ui Nova style initialized, violet theme restored, 13
  shadcn components installed, next-themes light/dark/system toggle,
  shadcn Sidebar (collapsible + mobile sheet), nav config, real dashboard
  layout, Sonner toasts at root

## WHAT'S NEXT (Sections 5–8)

- Section 5: Post CRUD — Tiptap editor, post form, Server Actions,
  TanStack Query, Vercel Blob uploads, post list with filters
- Section 6: Kanban board — DnD Kit drag-and-drop, optimistic updates
- Section 7: Calendar view — React Big Calendar, reschedule by drag
- Section 8: Dashboard analytics (Recharts) + Vercel deployment

---

## COMMON MISTAKES TO AVOID

1. Adding `'use client'` to page.tsx or layout.tsx — never correct
2. Fetching data in useEffect — use Server Components instead
3. Importing `@prisma/client` — import from `@/generated/prisma`
4. Running `prisma db push` — always use `prisma migrate dev`
5. Using `auth().userId` without await — must be `await auth()`
6. Calling `auth.protect()` in proxy.ts — use manual redirect (known bug)
7. Creating an API route for a mutation — use a Server Action
8. Querying without workspaceId scope — always scope to workspace
9. Using `cacheTime` in TanStack Query — it's `gcTime` in v5
10. Using `npx shadcn-ui@latest` — correct command is `npx shadcn@latest`
