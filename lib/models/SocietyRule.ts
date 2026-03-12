import mongoose, { Schema, Document } from "mongoose";

export interface ISocietyRule extends Document {
  rule_id: string;
  proposal_id: string;
  title: string;
  description: string;
  category: string;
  rule_type: "mechanical" | "cultural";
  mechanic_key: string | null;
  mechanic_value: string | null;
  cultural_key: string | null;
  cultural_value: string | null;
  status: "active" | "repealed";
  created_at: Date;
}

const SocietyRuleSchema = new Schema<ISocietyRule>({
  rule_id: { type: String, required: true, unique: true },
  proposal_id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  rule_type: { type: String, enum: ["mechanical", "cultural"], required: true },
  mechanic_key: { type: String, default: null },
  mechanic_value: { type: String, default: null },
  cultural_key: { type: String, default: null },
  cultural_value: { type: String, default: null },
  status: { type: String, enum: ["active", "repealed"], default: "active" },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.SocietyRule ||
  mongoose.model<ISocietyRule>("SocietyRule", SocietyRuleSchema);
