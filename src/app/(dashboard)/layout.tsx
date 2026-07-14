import { AppSidebar } from "@/components/layout/app-sidebar";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getOrCreateWorkspace } from "@/db/queries/workspace.queries";
import { requireCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // confirms session independent of proxy.ts
  const user = await requireCurrentUser();

  // check workspace exists
  const workspace = await getOrCreateWorkspace(
    user.id,
    user.emailAddresses[0]?.emailAddress ?? "",
    user.fullName,
    user.imageUrl,
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-svh overflow-hidden">
        <header className=" flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className=" -ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />

          <span className=" text-sm text-muted-foreground">
            {workspace.name}
          </span>
          <div className=" ml-auto flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        <div className=" flex flex-1 flex-col min-w-0 overflow-hidden p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
