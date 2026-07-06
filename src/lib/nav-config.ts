import type { Route } from "next";

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  KanbanSquare,
  CalendarDays,
  Settings,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: Route;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Posts", href: "/posts", icon: KanbanSquare },
  { title: "Calendar", href: "/calendar", icon: CalendarDays },
  { title: "Settings", href: "/settings", icon: Settings },
];
