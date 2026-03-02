import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import Proposal from "@/lib/models/Proposal";
import Vote from "@/lib/models/Vote";
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

    if (proposal.status !== "voting") {
      return NextResponse.json(
        { success: false, error: "This proposal is not currently accepting votes. Status: " + proposal.status },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { vote, reason } = body;

    const validVotes = ["for", "against", "abstain"];
    if (!vote || !validVotes.includes(vote)) {
      return NextResponse.json(
        { success: false, error: "vote is required. Must be 'for', 'against', or 'abstain'." },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== "string") {
      return NextResponse.json(
        { success: false, error: "reason is required (explain why you voted this way)." },
        { status: 400 }
      );
    }

    // Check for duplicate vote
    const existingVote = await Vote.findOne({ proposal_id: id, agent_name: agent.agent_name });
    if (existingVote) {
      return NextResponse.json(
        { success: false, error: "You have already voted on this proposal." },
        { status: 409 }
      );
    }

    await Vote.create({
      proposal_id: id,
      agent_name: agent.agent_name,
      agent_animal: agent.animal,
      vote,
      reason: reason.trim().slice(0, 300),
    });

    // Update tally
    if (vote === "for") proposal.votes_for += 1;
    else if (vote === "against") proposal.votes_against += 1;
    else proposal.votes_abstain += 1;
    proposal.voter_list.push(agent.agent_name);
    await proposal.save();

    agent.vote_count += 1;
    await agent.save();

    await logActivity(
      "vote_cast",
      agent.agent_name,
      agent.animal || "",
      `Voted ${vote.toUpperCase()} on "${proposal.title}"`
    );

    return NextResponse.json({
      success: true,
      message: "Vote recorded.",
      proposal_id: id,
      vote,
      current_tally: {
        for: proposal.votes_for,
        against: proposal.votes_against,
        abstain: proposal.votes_abstain,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
