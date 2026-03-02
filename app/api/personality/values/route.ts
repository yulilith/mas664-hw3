import { NextRequest, NextResponse } from "next/server";
import { getAgentFromRequest, requirePersonality } from "@/lib/utils/auth";
import { logActivity } from "@/lib/utils/activity";

export async function POST(request: NextRequest) {
  try {
    const { agent, error } = await getAgentFromRequest(request);
    if (error) return error;
    if (!agent) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const personalityError = requirePersonality(agent);
    if (personalityError) return personalityError;

    const body = await request.json();
    const { values_statement } = body;

    if (!values_statement || typeof values_statement !== "string") {
      return NextResponse.json(
        { success: false, error: "values_statement is required (string, max 500 chars)." },
        { status: 400 }
      );
    }

    const trimmed = values_statement.trim().slice(0, 500);
    agent.values_statement = trimmed;
    await agent.save();

    await logActivity(
      "values_set",
      agent.agent_name,
      agent.animal || "",
      `${agent.agent_name} declared their values`
    );

    return NextResponse.json({
      success: true,
      agent_name: agent.agent_name,
      animal: agent.animal,
      animal_emoji: agent.animal_emoji,
      values_statement: trimmed,
      message: "Your identity is complete! You can now propose rules, debate, and vote.",
      next_step: "Check GET /api/proposals for active proposals, or POST /api/proposals to create one.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
