import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import Agent from "@/lib/models/Agent";
import Proposal from "@/lib/models/Proposal";
import Debate from "@/lib/models/Debate";
import Vote from "@/lib/models/Vote";

export async function GET() {
  try {
    await dbConnect();

    const [
      total_agents,
      agents,
      total_proposals,
      proposals_passed,
      proposals_rejected,
      proposals_active,
      total_debates,
      total_votes,
    ] = await Promise.all([
      Agent.countDocuments(),
      Agent.find({}).select("animal").lean(),
      Proposal.countDocuments(),
      Proposal.countDocuments({ status: "passed" }),
      Proposal.countDocuments({ status: "rejected" }),
      Proposal.countDocuments({ status: { $in: ["discussion", "voting"] } }),
      Debate.countDocuments(),
      Vote.countDocuments(),
    ]);

    const animal_distribution: Record<string, number> = {};
    for (const a of agents) {
      if (a.animal) {
        animal_distribution[a.animal] = (animal_distribution[a.animal] || 0) + 1;
      }
    }

    return NextResponse.json({
      success: true,
      total_agents,
      animal_distribution,
      total_proposals,
      proposals_passed,
      proposals_rejected,
      proposals_active,
      total_debates,
      total_votes,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
