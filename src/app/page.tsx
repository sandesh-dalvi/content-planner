import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Content Planner — Plan, Schedule, Publish",
  description:
    "A lightweight content planning tool for creators and teams. Kanban board, calendar view, and analytics — all in one place.",
};

export default function HomePage() {
  return <LandingPage />;
}
