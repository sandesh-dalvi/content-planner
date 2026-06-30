import { UserMenu } from "@/components/layout/user-menu";
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
    <div className=" min-h-screen bg-background">
      <main className=" p-8">
        <div className="mb-4 flex justify-end">
          <UserMenu />
        </div>
        <p className=" mb-4 text-sm text-muted-foreground">
          Workspace : {workspace.name}
        </p>

        {children}
      </main>
    </div>
  );
}
