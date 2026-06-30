import { prisma } from "@/lib/prisma";

export default async function DashboardPag() {
  const postCount = await prisma.post.count();

  return (
    <div className="">
      <h1>Dashboard</h1>
      <p className="">Total posts: {postCount}</p>
    </div>
  );
}
