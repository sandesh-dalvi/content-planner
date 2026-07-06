import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Accepted image types for social media posts
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

// 4MB limit — stays under Vercel's 4.5MB serverless function body limit
const MAX_SIZE_BYTES = 4 * 1024 * 1024;

export async function POST(request: NextRequest) {
  // Authenticate — upload must be from a signed-in user
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `File type not allowed. Accepted: ${ALLOWED_TYPES.join(", ")}` },
      { status: 422 },
    );
  }

  // Validate size
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 4MB." },
      { status: 422 },
    );
  }

  const blob = await put(
    // Namespace uploads by userId to keep files organized
    `posts/${userId}/${file.name}`,
    file,
    {
      access: "public",
      // Random suffix prevents collisions and URL enumeration
      addRandomSuffix: true,
    },
  );

  return NextResponse.json({
    url: blob.url,
    filename: file.name,
    mimeType: file.type,
    size: file.size,
  });
}
