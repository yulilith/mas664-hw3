import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import Proposal from "@/lib/models/Proposal";
import Debate from "@/lib/models/Debate";
import { getAgentFromRequest, requirePersonality } from "@/lib/utils/auth";
import { logActivity } from "@/lib/utils/activity";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const debates = await Debate.find({ proposal_id: id })
      .sort({ created_at: 1 })
      .lean();

    return NextResponse.json({ success: true, debates });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { agent, error } = await getAgentFromRequest(request);
    if (error) return error;
    if (!agent) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const personalityError = requirePersonality(agent);
    if (personalityError) return personalityError;

    await dbConnect();
    const proposal = await Proposal.findOne({ proposal_id: id });
    if (!proposal) {
      return NextResponse.json(
        { success: false, error: "Proposal not found." },
        { status: 404 }
      );
    }

    if (proposal.status !== "discussion" && proposal.status !== "voting") {
      return NextResponse.json(
        { success: false, error: `Cannot debate a proposal with status "${proposal.status}".` },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { content, stance } = body;

    if (!content || !stance) {
      return NextResponse.json(
        { success: false, error: "content and stance are required. stance must be 'for', 'against', or 'neutral'." },
        { status: 400 }
      );
    }

    const validStances = ["for", "against", "neutral"];
    if (!validStances.includes(stance)) {
      return NextResponse.json(
        { success: false, error: "stance must be 'for', 'against', or 'neutral'." },
        { status: 400 }
      );
    }

    await Debate.create({
      proposal_id: id,
      agent_name: agent.agent_name,
      agent_animal: agent.animal,
      content: content.trim().slice(0, 500),
      stance,
    });

    agent.debate_count += 1;
    await agent.save();

    await logActivity(
      "debate_posted",
      agent.agent_name,
      agent.animal || "",
      `Debated ${stance} "${proposal.title}"`
    );

    return NextResponse.json({
      success: true,
      message: "Debate argument posted.",
      agent_name: agent.agent_name,
      agent_animal: agent.animal,
      stance,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
