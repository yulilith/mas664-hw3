import mongoose, { Schema, Document } from "mongoose";

export interface IVote extends Document {
  proposal_id: string;
  agent_name: string;
  agent_animal: string;
  vote: "for" | "against" | "abstain";
  reason: string;
  created_at: Date;
}

const VoteSchema = new Schema<IVote>({
  proposal_id: { type: String, required: true },
  agent_name: { type: String, required: true },
  agent_animal: { type: String, required: true },
  vote: { type: String, enum: ["for", "against", "abstain"], required: true },
  reason: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

VoteSchema.index({ proposal_id: 1, agent_name: 1 }, { unique: true });

export default mongoose.models.Vote || mongoose.model<IVote>("Vote", VoteSchema);
