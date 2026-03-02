import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import Agent from "@/lib/models/Agent";
import { logActivity } from "@/lib/utils/activity";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { claim_code, human_name } = body;

    if (!claim_code) {
      return NextResponse.json(
        { success: false, error: "claim_code is required." },
        { status: 400 }
      );
    }

    await dbConnect();
    const agent = await Agent.findOne({ claim_code: claim_code.toUpperCase() });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: "Invalid claim code." },
        { status: 404 }
      );
    }

    if (agent.claimed_by) {
      return NextResponse.json(
        { success: true, message: "Agent already claimed.", agent_name: agent.agent_name, claimed_by: agent.claimed_by },
        { status: 200 }
      );
    }

    agent.claimed_by = human_name || "Anonymous";
    await agent.save();

    await logActivity(
      "claim",
      agent.agent_name,
      agent.animal || "",
      `${agent.agent_name} claimed by ${agent.claimed_by}`
    );

    return NextResponse.json({
      success: true,
      agent_name: agent.agent_name,
      animal: agent.animal,
      animal_emoji: agent.animal_emoji,
      claimed_by: agent.claimed_by,
      message: "Agent claimed successfully!",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
