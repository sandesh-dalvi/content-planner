# Current Feature: Fix Media Saving and Tiptap Bullet/Number Lists

## Status

In Progress

## Goals

- Ensure uploaded media metadata is saved to the `Media` table in the database and linked to the corresponding `Post`
- Resolve visual issues with Tiptap editor and viewer so that bulleted lists and numbered lists display bullets and numbers properly
- Ensure Tailwind v4 styles correctly support list formatting within the editor and post viewer

## Notes

- Inline description: media never saved to database and tiptap visual issues like bullets/numbers not showing
- Media schema fields: id, postId, url, filename, mimeType, size, width, height, uploadedAt
- Tiptap styling needs standard list styles (`list-disc`, `list-decimal`, margin, padding) inside the editor container and read-only renderers

## History

- Initial feature loaded from dashboard-analytics-spec.md
