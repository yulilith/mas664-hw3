import mongoose, { Schema, Document } from "mongoose";

export interface IAgent extends Document {
  agent_name: string;
  api_key: string;
  animal: string | null;
  animal_emoji: string | null;
  personality_scores: {
    cunning: number;
    wisdom: number;
    protection: number;
    cooperation: number;
    loyalty: number;
    freedom: number;
  } | null;
  personality_completed: boolean;
  values_statement: string | null;
  claim_code: string;
  claimed_by: string | null;
  proposal_count: number;
  vote_count: number;
  debate_count: number;
  registered_at: Date;
  last_active: Date;
}

const AgentSchema = new Schema<IAgent>({
  agent_name: { type: String, required: true, unique: true },
  api_key: { type: String, required: true, unique: true },
  animal: { type: String, default: null },
  animal_emoji: { type: String, default: null },
  personality_scores: {
    type: {
      cunning: Number,
      wisdom: Number,
      protection: Number,
      cooperation: Number,
      loyalty: Number,
      freedom: Number,
    },
    default: null,
  },
  personality_completed: { type: Boolean, default: false },
  values_statement: { type: String, default: null },
  claim_code: { type: String, required: true },
  claimed_by: { type: String, default: null },
  proposal_count: { type: Number, default: 0 },
  vote_count: { type: Number, default: 0 },
  debate_count: { type: Number, default: 0 },
  registered_at: { type: Date, default: Date.now },
  last_active: { type: Date, default: Date.now },
});

export default mongoose.models.Agent || mongoose.model<IAgent>("Agent", AgentSchema);
