import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import ActivityLog from "@/lib/models/ActivityLog";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
    const agent = searchParams.get("agent");
    const type = searchParams.get("type");

    const filter: Record<string, string> = {};
    if (agent) filter.agent_name = agent;
    if (type) filter.event_type = type;

    const events = await ActivityLog.find(filter)
      .sort({ created_at: -1 })
      .limit(limit)
      .lean();

    const total = await ActivityLog.countDocuments(filter);

    return NextResponse.json({ success: true, events, total });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
