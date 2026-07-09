"use client";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import {
  useOptimistic,
  useTransition,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";

import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";

import {
  Calendar,
  dateFnsLocalizer,
  Views,
  type View,
} from "react-big-calendar";
import withDragAndDrop, {
  type withDragAndDropProps,
  type EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import { toast } from "sonner";

import { updatePost } from "@/app/actions/post.actions";

import { PLATFORM_BG_COLORS, PLATFORM_EMOJI } from "@/lib/calendar-config";
import type { KanbanPost } from "@/types";

// Localizer
// MUST be created outside the component.
// Recreating it inside the component causes the calendar to remount
// on every render, losing scroll position and selected date.
const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// DnD-enabled calendar
// Also created outside the component — withDragAndDrop returns a new
// component class. Creating it inside causes a new class on every render,
// which breaks React's reconciliation (full remount each render).
const DnDCalendar = withDragAndDrop<CalendarEvent>(Calendar);

// Event shape
// react-big-calendar requires events to have `title`, `start`, `end`.
// We extend with our post data via the `resource` field.
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: KanbanPost;
}

//
interface CalendarViewProps {
  initialPosts: KanbanPost[];
}

// Optimistic update action type
interface RescheduleAction {
  postId: string;
  scheduledFor: Date;
}

export function CalendarView({ initialPosts }: CalendarViewProps) {
  const router = useRouter();
  const [_, startTransition] = useTransition();
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());

  //   Optimistic posts state
  // Mirrors the Kanban board pattern: instant UI update while
  // the Server Action runs in the background.
  const [optimisticPosts, applyOptimisticReschedule] = useOptimistic(
    initialPosts,
    (state: KanbanPost[], action: RescheduleAction) =>
      state.map((p) =>
        p.id === action.postId
          ? { ...p, scheduledFor: action.scheduledFor }
          : p,
      ),
  );

  // Convert posts → calendar events
  // Wrapped in useMemo so it only recomputes when posts change,
  // not on every state update (view change, date navigation etc.)
  const events: CalendarEvent[] = useMemo(
    () =>
      optimisticPosts
        .filter(
          (p): p is KanbanPost & { scheduledFor: Date } =>
            p.scheduledFor !== null,
        )
        .map((p) => {
          const start = new Date(p.scheduledFor);
          // End = 30 minutes after start for visual height in week/day view.
          // In month view the duration is irrelevant — events render as chips.
          const end = new Date(start.getTime() + 30 * 60 * 1000);
          return {
            id: p.id,
            title: `${PLATFORM_EMOJI[p.platform]} ${p.title}`,
            start,
            end,
            resource: p,
          };
        }),
    [optimisticPosts],
  );

  // Event style getter
  // Returns inline styles applied to each event chip.
  // We use the platform colour as background and white text.
  const eventPropGetter = useCallback(
    (event: CalendarEvent) => ({
      style: {
        backgroundColor:
          PLATFORM_BG_COLORS[event.resource.platform] ?? "#6b7280",
        borderColor: "transparent",
        color: "#ffffff",
        borderRadius: "4px",
        fontSize: "12px",
        padding: "1px 4px",
        cursor: "pointer",
      },
    }),
    [],
  );

  // Day cell style
  // We don't apply custom day styles but this prop is required by
  // the type signature when using withDragAndDrop.
  const dayPropGetter = useCallback(() => ({}), []);

  // onSelectSlot — click empty date to create a post
  // `selectable` prop must be true for this to fire.
  const handleSelectSlot = useCallback(
    ({ start }: { start: Date }) => {
      // Format the date as ISO datetime-local string (YYYY-MM-DDTHH:mm)
      // which is what the datetime-local HTML input expects
      const formatted = format(start, "yyyy-MM-dd'T'HH:mm");
      router.push(
        `/posts/new?scheduledFor=${encodeURIComponent(formatted)}&status=SCHEDULED`,
      );
    },
    [router],
  );

  // onSelectEvent — click event to edit
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      router.push(`/posts/${event.id}/edit`);
    },
    [router],
  );

  // onEventDrop — drag event to reschedule
  // `start` can be Date or string depending on the calendar view.
  // Always convert to Date before using.
  const handleEventDrop = useCallback(
    ({ event, start }: EventInteractionArgs<CalendarEvent>) => {
      const newDate = new Date(start);

      startTransition(async () => {
        applyOptimisticReschedule({ postId: event.id, scheduledFor: newDate });

        const isoString = format(newDate, "yyyy-MM-dd'T'HH:mm");
        const result = await updatePost(event.id, { scheduledFor: isoString });

        if (!result.success) {
          toast.error("Failed to reschedule post. Try again.");
        } else {
          toast.success(`Rescheduled to ${format(newDate, "MMM d, h:mm a")}`);
        }
      });
    },
    [applyOptimisticReschedule],
  );

  return (
    // The calendar MUST have an explicit height — it renders
    // nothing without one. We use calc() to fill the available
    // page height below the page header.
    <div className="rbc-calendar-wrapper h-[calc(100vh-14rem)]">
      <DnDCalendar
        localizer={localizer}
        events={events}
        // Date accessors — tell the calendar how to read dates from events
        startAccessor="start"
        endAccessor="end"
        // View management
        view={currentView}
        onView={setCurrentView}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        date={currentDate}
        onNavigate={setCurrentDate}
        // Interaction
        selectable // Enables onSelectSlot
        resizable={false} // Disable event resize handles
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        onEventDrop={handleEventDrop}
        // Styling
        eventPropGetter={eventPropGetter}
        dayPropGetter={dayPropGetter}
        // Fill the parent container height
        style={{ height: "100%" }}
        // Toolbar config
        toolbar
        popup // Show "+N more" popup on month view
        // Accessibility label
        aria-label="Content calendar"
      />
    </div>
  );
}
