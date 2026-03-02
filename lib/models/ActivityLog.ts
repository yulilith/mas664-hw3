import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLog extends Document {
  event_type: string;
  agent_name: string;
  agent_animal: string;
  detail: string;
  created_at: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  event_type: { type: String, required: true },
  agent_name: { type: String, required: true },
  agent_animal: { type: String, default: "" },
  detail: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

ActivityLogSchema.index({ created_at: -1 });

export default mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
