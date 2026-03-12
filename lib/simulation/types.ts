export interface TraitAlignment {
  cunning: number;
  wisdom: number;
  protection: number;
  cooperation: number;
  loyalty: number;
  freedom: number;
}

export interface ProposalTemplate {
  title: string;
  description: string;
  category: "governance" | "resources" | "culture" | "safety" | "freedom" | "trade";
  rule_type: "mechanical" | "cultural";
  mechanic_key?: string;
  mechanic_value?: string | number;
  cultural_key?: string;
  cultural_value?: string;
  trait_alignment: TraitAlignment;
}

export interface RuleSet {
  min_debates_before_vote: number;
  vote_quorum: number;
  max_active_proposals_per_agent: number;
  festival_interval_ticks: number;
  vote_compulsion: "mandatory" | "voluntary";
  innovation_reward: "inactive" | "active";
  greeting_style: "none" | "tidal";
  debate_formality: "casual" | "formal";
}

export const DEFAULT_RULE_SET: RuleSet = {
  min_debates_before_vote: 0,
  vote_quorum: 1,
  max_active_proposals_per_agent: 999,
  festival_interval_ticks: 0,
  vote_compulsion: "mandatory",
  innovation_reward: "inactive",
  greeting_style: "none",
  debate_formality: "casual",
};

export type SimAction = "propose" | "debate" | "start-vote" | "vote" | "resolve";

export interface TickResult {
  tick: number;
  actions: ActionResult[];
  festival?: boolean;
}

export interface ActionResult {
  agent_name: string;
  agent_animal: string;
  action: SimAction;
  detail: string;
  success: boolean;
}
