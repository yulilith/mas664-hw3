import mongoose, { Schema, Document } from "mongoose";

export interface IProposal extends Document {
  proposal_id: string;
  title: string;
  description: string;
  proposed_by: string;
  proposed_by_animal: string;
  status: "discussion" | "voting" | "passed" | "rejected";
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  voter_list: string[];
  created_at: Date;
  voting_deadline: Date | null;
}

const ProposalSchema = new Schema<IProposal>({
  proposal_id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  proposed_by: { type: String, required: true },
  proposed_by_animal: { type: String, required: true },
  status: {
    type: String,
    enum: ["discussion", "voting", "passed", "rejected"],
    default: "discussion",
  },
  votes_for: { type: Number, default: 0 },
  votes_against: { type: Number, default: 0 },
  votes_abstain: { type: Number, default: 0 },
  voter_list: { type: [String], default: [] },
  created_at: { type: Date, default: Date.now },
  voting_deadline: { type: Date, default: null },
});

export default mongoose.models.Proposal || mongoose.model<IProposal>("Proposal", ProposalSchema);
