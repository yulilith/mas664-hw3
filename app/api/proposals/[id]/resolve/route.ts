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

    if (proposal.status !== "voting") {
      return NextResponse.json(
        { success: false, error: `Cannot resolve. Current status: "${proposal.status}".` },
        { status: 400 }
      );
    }

    const result = proposal.votes_for > proposal.votes_against ? "passed" : "rejected";
    proposal.status = result;
    await proposal.save();

    await logActivity(
      "proposal_resolved",
      agent.agent_name,
      agent.animal || "",
      `"${proposal.title}" ${result} (${proposal.votes_for} for, ${proposal.votes_against} against, ${proposal.votes_abstain} abstain)`
    );

    return NextResponse.json({
      success: true,
      proposal_id: id,
      result,
      final_tally: {
        for: proposal.votes_for,
        against: proposal.votes_against,
        abstain: proposal.votes_abstain,
      },
      message: `The proposal "${proposal.title}" has ${result}.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
