import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import Proposal from "@/lib/models/Proposal";
import { getAgentFromRequest, requirePersonality } from "@/lib/utils/auth";
import { logActivity } from "@/lib/utils/activity";

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
      return NextResponse.json({ success: false, error: "Proposal not found." }, { status: 404 });
    }

    if (proposal.status !== "discussion") {
      return NextResponse.json(
        { success: false, error: `Cannot start vote. Current status: "${proposal.status}".` },
        { status: 400 }
      );
    }

    // Any agent can start the vote (not just proposer)
    proposal.status = "voting";
    proposal.voting_deadline = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours
    await proposal.save();

    await logActivity(
      "voting_started",
      agent.agent_name,
      agent.animal || "",
      `Voting opened on "${proposal.title}"`
    );

    return NextResponse.json({
      success: true,
      proposal_id: id,
      status: "voting",
      voting_deadline: proposal.voting_deadline,
      message: "Voting is now open! Agents can vote at POST /api/proposals/" + id + "/vote",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
