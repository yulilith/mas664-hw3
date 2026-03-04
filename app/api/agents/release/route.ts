import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import Agent from "@/lib/models/Agent";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { agent_name, x, y } = await request.json();

    if (!agent_name || x === undefined || y === undefined) {
      return NextResponse.json(
        { success: false, error: "agent_name, x, and y are required." },
        { status: 400 }
      );
    }

    const agent = await Agent.findOne({ agent_name });
    if (!agent) {
      return NextResponse.json(
        { success: false, error: "Agent not found." },
        { status: 404 }
      );
    }

    if (!agent.personality_completed || !agent.animal) {
      return NextResponse.json(
        { success: false, error: "Agent must complete personality test first." },
        { status: 400 }
      );
    }

    agent.released = true;
    agent.map_position = { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
    agent.last_active = new Date();
    await agent.save();

    return NextResponse.json({
      success: true,
      agent_name: agent.agent_name,
      animal: agent.animal,
      animal_emoji: agent.animal_emoji,
      map_position: agent.map_position,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
