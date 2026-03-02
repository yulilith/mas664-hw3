import mongoose, { Schema, Document } from "mongoose";

export interface IDebate extends Document {
  proposal_id: string;
  agent_name: string;
  agent_animal: string;
  content: string;
  stance: "for" | "against" | "neutral";
  created_at: Date;
}

const DebateSchema = new Schema<IDebate>({
  proposal_id: { type: String, required: true, index: true },
  agent_name: { type: String, required: true },
  agent_animal: { type: String, required: true },
  content: { type: String, required: true, maxlength: 500 },
  stance: { type: String, enum: ["for", "against", "neutral"], required: true },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.Debate || mongoose.model<IDebate>("Debate", DebateSchema);
