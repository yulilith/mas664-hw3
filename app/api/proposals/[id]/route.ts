import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import Proposal from "@/lib/models/Proposal";
import Debate from "@/lib/models/Debate";
import Vote from "@/lib/models/Vote";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const proposal = await Proposal.findOne({ proposal_id: id }).lean();
    if (!proposal) {
      return NextResponse.json(
        { success: false, error: "Proposal not found." },
        { status: 404 }
      );
    }

    const debates = await Debate.find({ proposal_id: id })
      .sort({ created_at: 1 })
      .lean();

    const votes = await Vote.find({ proposal_id: id })
      .sort({ created_at: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      proposal,
      debates,
      votes,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
