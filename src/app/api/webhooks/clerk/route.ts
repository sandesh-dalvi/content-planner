import { NextRequest, NextResponse } from "next/server";

import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { prisma } from "@/lib/prisma";
import { generateUniqueWorkspaceSlug } from "@/lib/slug";

export async function POST(req: NextRequest) {
  // verify the Svix signature.it's what proves the request actually came from Clerk and not an attacker spoofing a payload.

  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch (err) {
    console.error("Webhook signature verification failed: ", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const email = email_addresses[0]?.email_address;
    const name =
      [first_name, last_name].filter(Boolean).join(" ").trim() || null;

    if (!email) {
      console.error("Webhook user event missing email:", id);
      return NextResponse.json({ received: true });
    }

    // Upsert — handles both first-time creation AND the case where JIT provisioning
    const user = await prisma.user.upsert({
      where: { id },
      update: { email, name, image: image_url },
      create: { id, email, name, image: image_url },
    });

    // Only create a workspace if one doesn't already exist.
    // JIT provisioning likely already created it — this branch mainly covers the rare case where the webhook arrives first.
    const existingWorkspace = await prisma.workspace.findUnique({
      where: { userId: user.id },
    });

    if (!existingWorkspace) {
      const workspaceName = name ? `${name}'s Workspace` : "My Workspace";
      const slug = await generateUniqueWorkspaceSlug(workspaceName);

      await prisma.workspace.create({
        data: { userId: user.id, name: workspaceName, slug },
      });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    if (id) {
      // Cascade delete handles Workspace + Posts + Media automatically
      await prisma.user.delete({ where: { id } }).catch(() => {});
    }
  }

  return NextResponse.json({ received: true });
}
