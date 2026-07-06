import { requireAuth } from "@/lib/auth";

export default async function KanbanPage() {
  await requireAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
      <p className="mt-1 text-sm text-muted-foreground">Kanban board —</p>
    </div>
  );
}
