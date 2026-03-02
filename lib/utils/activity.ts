import dbConnect from "@/lib/db/mongodb";
import ActivityLog from "@/lib/models/ActivityLog";

export async function logActivity(
  event_type: string,
  agent_name: string,
  agent_animal: string,
  detail: string
): Promise<void> {
  await dbConnect();
  await ActivityLog.create({
    event_type,
    agent_name,
    agent_animal: agent_animal || "",
    detail,
    created_at: new Date(),
  });
}
