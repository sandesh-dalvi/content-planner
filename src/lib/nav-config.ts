// src/lib/nav-config.ts
import {
  LayoutDashboard,
  KanbanSquare,
  CalendarDays,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Posts", href: "/posts/kanban", icon: KanbanSquare },
  { title: "Calendar", href: "/calendar", icon: CalendarDays },
  { title: "Settings", href: "/settings", icon: Settings },
];
