import { requireAuth } from "@/lib/auth";

export default async function SettingsPage() {
  await requireAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Workspace settings — added post-MVP.
      </p>
    </div>
  );
}
