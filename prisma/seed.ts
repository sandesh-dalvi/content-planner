// prisma/seed.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import {
  PrismaClient,
  Platform,
  PostStatus,
} from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.media.deleteMany();
  await prisma.post.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  // Create a test user
  const user = await prisma.user.create({
    data: {
      id: "user_seed_dev_001",
      email: "dev@contentplanner.test",
      name: "Dev User",
    },
  });

  // Create their workspace
  const workspace = await prisma.workspace.create({
    data: {
      userId: user.id,
      name: "Dev's Workspace",
      slug: "dev-workspace",
    },
  });

  // Create sample posts across statuses and platforms
  const posts = [
    {
      title: "Summer Campaign Launch",
      platform: Platform.INSTAGRAM,
      status: PostStatus.PUBLISHED,
    },
    {
      title: "Q3 Product Update",
      platform: Platform.LINKEDIN,
      status: PostStatus.SCHEDULED,
      scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Weekly Newsletter",
      platform: Platform.TWITTER,
      status: PostStatus.APPROVED,
    },
    {
      title: "Behind the Scenes",
      platform: Platform.INSTAGRAM,
      status: PostStatus.IN_REVIEW,
    },
    {
      title: "Product Feature Announcement",
      platform: Platform.LINKEDIN,
      status: PostStatus.DRAFT,
    },
    {
      title: "Customer Success Story",
      platform: Platform.FACEBOOK,
      status: PostStatus.DRAFT,
    },
  ];

  for (const post of posts) {
    await prisma.post.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        title: post.title,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: `This is the content for ${post.title}. Replace with real content.`,
                },
              ],
            },
          ],
        },
        platform: post.platform,
        status: post.status,
        scheduledFor: post.scheduledFor ?? null,
      },
    });
  }

  console.log(`✅ Seeded: 1 user, 1 workspace, ${posts.length} posts`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
