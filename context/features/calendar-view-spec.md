# Feature: CALENDAR VIEW

## Overview

A fully interactive calendar showing scheduled posts as colour-coded events by platform. Clicking an empty date opens the create form pre-filled with that date. Dragging an event to a new date reschedules it immediately with optimistic feedback.

## Requirements

- Installing the missing type dependency
- A dedicated calendar query (only posts with a scheduled date)
- The calendar page as a Server Component
- The CalendarView client component — full setup with localizer, drag-and-drop HOC, event styling, view switching
- CSS override strategy: react-big-calendar's default styles overridden to match the violet theme
- onSelectSlot → click-to-create (navigates to new post with date pre-filled)
- onEventDrop → drag-to-reschedule with useOptimistic
- onSelectEvent → click event to edit
- Updating NewPostPage and PostForm to accept a pre-filled scheduledFor from the calendar
