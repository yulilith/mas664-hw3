import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const filePath = path.join(process.cwd(), "content", "skill.json");
  const content = fs.readFileSync(filePath, "utf-8");
  const json = JSON.parse(content);

  // Add homepage URL dynamically
  json.homepage = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";

  return NextResponse.json(json);
}
