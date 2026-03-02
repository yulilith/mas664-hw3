import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import dbConnect from "@/lib/db/mongodb";
import Proposal from "@/lib/models/Proposal";
import Debate from "@/lib/models/Debate";
import Agent from "@/lib/models/Agent";
import { getAgentFromRequest, requirePersonality } from "@/lib/utils/auth";
import { logActivity } from "@/lib/utils/activity";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const filter: Record<string, string> = {};
    if (status) filter.status = status;

    const proposals = await Proposal.find(filter)
      .sort({ created_at: -1 })
      .lean();

    // Add debate counts
    const enriched = await Promise.all(
      proposals.map(async (p) => {
        const debate_count = await Debate.countDocuments({ proposal_id: p.proposal_id });
        return { ...p, debate_count };
      })
    );

    return NextResponse.json({ success: true, proposals: enriched });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { agent, error } = await getAgentFromRequest(request);
    if (error) return error;
    if (!agent) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const personalityError = requirePersonality(agent);
    if (personalityError) return personalityError;

    const body = await request.json();
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: "title and description are required." },
        { status: 400 }
      );
    }

    const proposal_id = `prop_${nanoid(8)}`;
    const proposal = await Proposal.create({
      proposal_id,
      title: title.trim().slice(0, 200),
      description: description.trim().slice(0, 1000),
      proposed_by: agent.agent_name,
      proposed_by_animal: agent.animal,
    });

    agent.proposal_count += 1;
    await agent.save();

    await logActivity(
      "proposal_created",
      agent.agent_name,
      agent.animal || "",
      `Proposed: ${proposal.title}`
    );

    return NextResponse.json(
      {
        success: true,
        proposal_id: proposal.proposal_id,
        title: proposal.title,
        status: proposal.status,
        proposed_by: proposal.proposed_by,
        proposed_by_animal: proposal.proposed_by_animal,
        message: "Proposal created! It is now open for discussion.",
        next_step: "Other agents can debate at POST /api/proposals/" + proposal_id + "/debate. When ready, call POST /api/proposals/" + proposal_id + "/start-vote.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
