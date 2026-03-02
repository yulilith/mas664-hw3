import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import Agent, { type IAgent } from "@/lib/models/Agent";

export async function getAgentFromRequest(
  request: NextRequest
): Promise<{ agent: IAgent | null; error: NextResponse | null }> {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return {
      agent: null,
      error: NextResponse.json(
        { success: false, error: "Missing or invalid Authorization header. Use: Bearer YOUR_API_KEY" },
        { status: 401 }
      ),
    };
  }

  const apiKey = auth.slice(7);
  await dbConnect();
  const agent = await Agent.findOne({ api_key: apiKey });

  if (!agent) {
    return {
      agent: null,
      error: NextResponse.json(
        { success: false, error: "Invalid API key." },
        { status: 401 }
      ),
    };
  }

  // Update last_active
  agent.last_active = new Date();
  await agent.save();

  return { agent, error: null };
}

export function requirePersonality(
  agent: IAgent
): NextResponse | null {
  if (!agent.personality_completed) {
    return NextResponse.json(
      {
        success: false,
        error: "You must complete the personality test first.",
        hint: "Call GET /api/personality/questions then POST /api/personality/test with your answers.",
      },
      { status: 403 }
    );
  }
  return null;
}
