# Feature: POST MANAGEMENT (CRUD)

## Overview

A user can create a post with a rich text body, upload images, set platform, status, and scheduled date — and edit or delete any post. The list view shows all posts with working filters. All pages remain Server Components.

## Requirements

- Installing all required packages
- The Zod validation schema (single source of truth for form + action)
- Server Actions for createPost, updatePost, deletePost — auth on every action
- The Tiptap rich text editor as a client component with a custom toolbar
- The post form with React Hook Form + Zod + useTransition for pending state
- Image upload using Vercel Blob client-upload pattern (bypasses 4.5MB serverless limit)
- posts/new/page.tsx and posts/[id]/edit/page.tsx — both pure Server Components
- posts/page.tsx — list view with status and platform filters
- TanStack Query v5 wired into Providers for Client Component mutation hooks
- delete-post-button.tsx with confirm dialog
