# Feature: KANBAN BOARD

## Overview

A fully working Kanban board where dragging a card between columns immediately moves it visually and persists the new status via the Server Action, with error recovery if the action fails.

## Requirements

- Package version decision and why the legacy stable API is correct
- Kanban data flow: Server Component fetches → Client Component renders with optimistic state
- useOptimistic (React 19) for instant drag feedback before the Server Action resolves
- DndContext setup with correct sensors and collision detection
- useDroppable columns with visual hover feedback
- useDraggable cards with proper transform application
- DragOverlay — the floating ghost card during drag
- Linking the updatePostStatus Server Action from Section 5
- Handling the empty column drop target edge case
- Mobile touch support via PointerSensor
