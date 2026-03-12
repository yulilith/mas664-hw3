import { SimAction, RuleSet } from "./types";
import { IAgent } from "@/lib/models/Agent";
import { IProposal } from "@/lib/models/Proposal";

interface ActionCandidate {
  action: SimAction;
  weight: number;
  target?: IProposal;
}

// Base weights per animal type
const ANIMAL_WEIGHTS: Record<string, Record<SimAction, number>> = {
  fox:     { propose: 30, debate: 20, "start-vote": 15, vote: 20, resolve: 15 },
  owl:     { propose: 15, debate: 35, "start-vote": 15, vote: 20, resolve: 15 },
  bear:    { propose: 15, debate: 20, "start-vote": 15, vote: 25, resolve: 25 },
  dolphin: { propose: 15, debate: 30, "start-vote": 15, vote: 25, resolve: 15 },
  wolf:    { propose: 10, debate: 20, "start-vote": 15, vote: 35, resolve: 20 },
  eagle:   { propose: 30, debate: 20, "start-vote": 20, vote: 15, resolve: 15 },
};

export function selectAction(
  agent: IAgent,
  proposals: IProposal[],
  ruleSet: RuleSet,
  agentActiveProposalCount: number,
  debatedProposalIds: Set<string>,
  votedProposalIds: Set<string>,
  debateCountMap: Record<string, number>
): ActionCandidate | null {
  const animal = agent.animal || "fox";
  const baseWeights = ANIMAL_WEIGHTS[animal] || ANIMAL_WEIGHTS.fox;
  const candidates: ActionCandidate[] = [];

  // PROPOSE — blocked by max_active_proposals_per_agent
  if (agentActiveProposalCount < ruleSet.max_active_proposals_per_agent) {
    let weight = baseWeights.propose;
    if (ruleSet.innovation_reward === "active" && (animal === "fox" || animal === "eagle")) {
      weight *= 1.5;
    }
    candidates.push({ action: "propose", weight });
  }

  // DEBATE — only on proposals agent hasn't debated
  const debatableProposals = proposals.filter(
    p => (p.status === "discussion" || p.status === "voting") && !debatedProposalIds.has(p.proposal_id)
  );
  if (debatableProposals.length > 0) {
    const target = debatableProposals[Math.floor(Math.random() * debatableProposals.length)];
    candidates.push({ action: "debate", weight: baseWeights.debate, target });
  }

  // START-VOTE — only on discussion proposals meeting min_debates_before_vote
  const startVoteProposals = proposals.filter(
    p => p.status === "discussion" && (debateCountMap[p.proposal_id] || 0) >= ruleSet.min_debates_before_vote
  );
  if (startVoteProposals.length > 0) {
    const target = startVoteProposals[Math.floor(Math.random() * startVoteProposals.length)];
    candidates.push({ action: "start-vote", weight: baseWeights["start-vote"], target });
  }

  // VOTE — only on voting proposals agent hasn't voted on
  const votableProposals = proposals.filter(
    p => p.status === "voting" && !votedProposalIds.has(p.proposal_id)
  );
  if (votableProposals.length > 0) {
    const target = votableProposals[Math.floor(Math.random() * votableProposals.length)];
    candidates.push({ action: "vote", weight: baseWeights.vote, target });
  }

  // RESOLVE — only voting proposals past deadline or with enough votes
  const resolvableProposals = proposals.filter(
    p => p.status === "voting" && p.voting_deadline && new Date(p.voting_deadline) <= new Date()
  );
  if (resolvableProposals.length > 0) {
    const target = resolvableProposals[Math.floor(Math.random() * resolvableProposals.length)];
    // High priority for expired deadlines
    candidates.push({ action: "resolve", weight: baseWeights.resolve * 2, target });
  }

  if (candidates.length === 0) return null;

  // Weighted random selection
  const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const candidate of candidates) {
    roll -= candidate.weight;
    if (roll <= 0) return candidate;
  }

  return candidates[candidates.length - 1];
}
