import { RuleSet, DEFAULT_RULE_SET } from "./types";
import SocietyRule, { ISocietyRule } from "@/lib/models/SocietyRule";
import dbConnect from "@/lib/db/mongodb";

export async function buildRuleSet(): Promise<RuleSet> {
  await dbConnect();
  const activeRules = await SocietyRule.find({ status: "active" }).lean<ISocietyRule[]>();

  const ruleSet: RuleSet = { ...DEFAULT_RULE_SET };

  for (const rule of activeRules) {
    if (rule.rule_type === "mechanical" && rule.mechanic_key && rule.mechanic_value) {
      const key = rule.mechanic_key as keyof RuleSet;
      const val = rule.mechanic_value;
      if (key in ruleSet) {
        const numVal = Number(val);
        if (!isNaN(numVal)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (ruleSet as any)[key] = numVal;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (ruleSet as any)[key] = val;
        }
      }
    } else if (rule.rule_type === "cultural" && rule.cultural_key && rule.cultural_value) {
      const key = rule.cultural_key as keyof RuleSet;
      if (key in ruleSet) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ruleSet as any)[key] = rule.cultural_value;
      }
    }
  }

  return ruleSet;
}

export async function createRuleFromProposal(
  proposalId: string,
  title: string,
  description: string,
  category: string,
  ruleType: "mechanical" | "cultural",
  mechanicKey: string | null,
  mechanicValue: string | number | null,
  culturalKey: string | null,
  culturalValue: string | null
): Promise<ISocietyRule> {
  await dbConnect();

  // Repeal conflicting rules (same key)
  const conflictKey = ruleType === "mechanical" ? mechanicKey : culturalKey;
  if (conflictKey) {
    const keyField = ruleType === "mechanical" ? "mechanic_key" : "cultural_key";
    await SocietyRule.updateMany(
      { [keyField]: conflictKey, status: "active" },
      { $set: { status: "repealed" } }
    );
  }

  const ruleId = `rule_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const rule = await SocietyRule.create({
    rule_id: ruleId,
    proposal_id: proposalId,
    title,
    description,
    category,
    rule_type: ruleType,
    mechanic_key: mechanicKey || null,
    mechanic_value: mechanicValue != null ? String(mechanicValue) : null,
    cultural_key: culturalKey || null,
    cultural_value: culturalValue || null,
    status: "active",
    created_at: new Date(),
  });

  return rule;
}
