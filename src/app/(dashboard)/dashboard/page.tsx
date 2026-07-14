import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { requireAuth } from "@/lib/auth";
import { getWorkspaceByUserId } from "@/db/queries/workspace.queries";
import { getPostStats } from "@/db/queries/posts.queries";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformChart } from "@/components/dashboard/charts/platform-chart";
import { StatusChart } from "@/components/dashboard/charts/status-chart";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { userId } = await requireAuth();
  const workspace = await getWorkspaceByUserId(userId);

  if (!workspace) notFound();

  const { total, byStatus, byPlatform, scheduled, published } =
    await getPostStats(workspace.id);

  // Transform Prisma groupBy output into chart-friendly arrays.
  // This transformation is intentionally done in the Server Component
  // (no client bundle cost) before passing to chart Client Components.
  const platformData = byPlatform.map((item) => ({
    platform: item.platform,
    count: item._count.platform,
  }));

  const statusData = byStatus.map((item) => ({
    status: item.status,
    count: item._count.status,
  }));

  const isEmpty = total === 0;

  return (
    <div className=" space-y-6">
      <div className=" flex items-center justify-between">
        <div className="">
          <h1 className=" text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className=" mt-1 text-sm text-muted-foreground">
            {workspace.name} - content overview
          </p>
        </div>

        <Button asChild>
          <Link href={"/posts/new"}>
            <Plus className=" mr-2 h-4 w-4" /> New Post
          </Link>
        </Button>
      </div>

      {isEmpty ? (
        <div className="flex min-h-100 flex-col items-center justify-center rounded-xl border border-dashed border-border">
          <p className="text-4xl mb-4">📊</p>
          <h2 className="text-lg font-semibold mb-2">No data yet</h2>
          <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
            Create your first post to start seeing analytics here.
          </p>
          <Button asChild>
            <Link href="/posts/new">
              <Plus className="mr-2 h-4 w-4" />
              Create First Post
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <StatsCards
            total={total}
            published={published}
            scheduled={scheduled}
          />

          <div className=" grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Platform */}
            <Card>
              <CardHeader className=" pb-2">
                <CardTitle className=" text-base font-semibold">
                  Posts by Platform
                </CardTitle>
              </CardHeader>

              <CardContent>
                <PlatformChart data={platformData} />
              </CardContent>
            </Card>

            {/* Status bar */}
            <Card>
              <CardHeader className=" pb-2">
                <CardTitle className=" text-base font-semibold">
                  Status Breakdown
                </CardTitle>
              </CardHeader>

              <CardContent>
                <StatusChart data={statusData} />
              </CardContent>
            </Card>
          </div>

          {/* quick nav cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/posts/kanban"
              className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <span className="text-2xl">📋</span>
              <span className="font-semibold text-card-foreground">
                Kanban Board
              </span>
              <span className="text-sm text-muted-foreground">
                Manage your content workflow
              </span>
            </Link>

            <Link
              href="/calendar"
              className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <span className="text-2xl">📅</span>
              <span className="font-semibold text-card-foreground">
                Calendar View
              </span>
              <span className="text-sm text-muted-foreground">
                See your scheduled content
              </span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
