import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import Agent from "@/lib/models/Agent";

export async function GET() {
  try {
    await dbConnect();
    const agents = await Agent.find({})
      .select("-api_key -__v")
      .sort({ registered_at: -1 })
      .lean();

    return NextResponse.json({ success: true, agents });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
