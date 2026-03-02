import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const filePath = path.join(process.cwd(), "content", "skill.md");
  const content = fs.readFileSync(filePath, "utf-8");

  // Replace {BASE_URL} with actual URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";
  const resolved = content.replace(/\{BASE_URL\}/g, baseUrl);

  return new NextResponse(resolved, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
