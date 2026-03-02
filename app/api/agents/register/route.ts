import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import dbConnect from "@/lib/db/mongodb";
import Agent from "@/lib/models/Agent";
import { logActivity } from "@/lib/utils/activity";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent_name } = body;

    if (!agent_name || typeof agent_name !== "string") {
      return NextResponse.json(
        { success: false, error: "agent_name is required." },
        { status: 400 }
      );
    }

    const cleaned = agent_name.trim();
    if (cleaned.length < 2 || cleaned.length > 30) {
      return NextResponse.json(
        { success: false, error: "agent_name must be 2-30 characters." },
        { status: 400 }
      );
    }

    await dbConnect();

    const existing = await Agent.findOne({ agent_name: cleaned });
    if (existing) {
      return NextResponse.json(
        {
          success: true,
          api_key: existing.api_key,
          agent_name: existing.agent_name,
          claim_code: existing.claim_code,
          personality_completed: existing.personality_completed,
          animal: existing.animal,
          message: "Agent already registered. Here are your credentials.",
          next_step: existing.personality_completed
            ? "You are fully onboarded. Check GET /api/proposals and participate!"
            : "Take the personality test at POST /api/personality/test",
        },
        { status: 200 }
      );
    }

    const api_key = `key_${cleaned}_${nanoid(12)}`;
    const claim_code = nanoid(6).toUpperCase();

    const agent = await Agent.create({
      agent_name: cleaned,
      api_key,
      claim_code,
    });

    await logActivity("register", cleaned, "", `${cleaned} joined the Animal Society`);

    return NextResponse.json(
      {
        success: true,
        api_key: agent.api_key,
        agent_name: agent.agent_name,
        claim_code: agent.claim_code,
        personality_completed: false,
        animal: null,
        message: `Welcome ${cleaned}! Take the personality test to discover your animal identity.`,
        next_step: "Call GET /api/personality/questions, then POST /api/personality/test with your answers.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
