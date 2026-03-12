import dbConnect from "@/lib/db/mongodb";
import Agent, { IAgent } from "@/lib/models/Agent";
import Proposal from "@/lib/models/Proposal";
import Debate from "@/lib/models/Debate";
import Vote from "@/lib/models/Vote";
import SocietyRule from "@/lib/models/SocietyRule";
import { logActivity } from "@/lib/utils/activity";
import { buildRuleSet, createRuleFromProposal } from "./ruleEnforcer";
import { selectAction } from "./actionSelector";
import { generateDebateContent } from "./debateTemplates";
import { computeVoteDecision, getVoteReason } from "./votingLogic";
import { PROPOSAL_POOL } from "./proposalPool";
import { TickResult, ActionResult } from "./types";

// Global tick counter (resets on server restart, but that's fine)
let globalTickCount = 0;

export async function runTick(): Promise<TickResult> {
  await dbConnect();
  globalTickCount++;

  const ruleSet = await buildRuleSet();
  const actions: ActionResult[] = [];

  // Check festival rule
  if (
    ruleSet.festival_interval_ticks > 0 &&
    globalTickCount % ruleSet.festival_interval_ticks === 0
  ) {
    await logActivity(
      "festival",
      "Society",
      "",
      "The Festival of the Full Moon Tide! All governance pauses as the reef celebrates together."
    );
    return { tick: globalTickCount, actions: [], festival: true };
  }

  // Auto-resolve expired voting proposals
  const expiredProposals = await Proposal.find({
    status: "voting",
    voting_deadline: { $lte: new Date() },
  });

  for (const proposal of expiredProposals) {
    const totalVotes = proposal.votes_for + proposal.votes_against + proposal.votes_abstain;

    if (totalVotes < ruleSet.vote_quorum) {
      // Extend deadline by 6 hours if quorum not met
      proposal.voting_deadline = new Date(Date.now() + 6 * 60 * 60 * 1000);
      await proposal.save();
      await logActivity(
        "deadline_extended",
        "Society",
        "",
        `Voting on "${proposal.title}" extended — quorum of ${ruleSet.vote_quorum} not met (${totalVotes} votes so far)`
      );
      actions.push({
        agent_name: "Society",
        agent_animal: "",
        action: "resolve",
        detail: `Deadline extended for "${proposal.title}" (quorum not met)`,
        success: true,
      });
      continue;
    }

    const result = proposal.votes_for > proposal.votes_against ? "passed" : "rejected";
    proposal.status = result;
    await proposal.save();

    await logActivity(
      "proposal_resolved",
      "Society",
      "",
      `"${proposal.title}" auto-resolved: ${result} (${proposal.votes_for} for, ${proposal.votes_against} against, ${proposal.votes_abstain} abstain)`
    );

    actions.push({
      agent_name: "Society",
      agent_animal: "",
      action: "resolve",
      detail: `"${proposal.title}" ${result}`,
      success: true,
    });

    // If passed, create a society rule
    if (result === "passed") {
      await tryCreateRule(proposal);
    }
  }

  // Select 2-4 random agents with completed personalities
  const allAgents = await Agent.find({ personality_completed: true });
  if (allAgents.length === 0) {
    return { tick: globalTickCount, actions };
  }

  const agentCount = Math.min(allAgents.length, 2 + Math.floor(Math.random() * 3));
  const shuffled = allAgents.sort(() => Math.random() - 0.5);
  const selectedAgents = shuffled.slice(0, agentCount);

  // Load all active proposals
  const allProposals = await Proposal.find({
    status: { $in: ["discussion", "voting"] },
  });

  // Build debate count map
  const debateCounts = await Debate.aggregate([
    { $match: { proposal_id: { $in: allProposals.map(p => p.proposal_id) } } },
    { $group: { _id: "$proposal_id", count: { $sum: 1 } } },
  ]);
  const debateCountMap: Record<string, number> = {};
  for (const dc of debateCounts) {
    debateCountMap[dc._id] = dc.count;
  }

  // Execute actions for each selected agent
  for (const agent of selectedAgents) {
    const result = await executeAgentAction(agent, allProposals, ruleSet, debateCountMap);
    if (result) {
      actions.push(result);
    }
  }

  return { tick: globalTickCount, actions };
}

async function executeAgentAction(
  agent: IAgent,
  proposals: ReturnType<typeof Array<any>>,
  ruleSet: Awaited<ReturnType<typeof buildRuleSet>>,
  debateCountMap: Record<string, number>
): Promise<ActionResult | null> {
  // Get agent's debated and voted proposals
  const agentDebates = await Debate.find({ agent_name: agent.agent_name }).select("proposal_id");
  const debatedIds = new Set(agentDebates.map(d => d.proposal_id));

  const agentVotes = await Vote.find({ agent_name: agent.agent_name }).select("proposal_id");
  const votedIds = new Set(agentVotes.map(v => v.proposal_id));

  // Count agent's active proposals
  const activeProposalCount = await Proposal.countDocuments({
    proposed_by: agent.agent_name,
    status: { $in: ["discussion", "voting"] },
  });

  const selected = selectAction(
    agent,
    proposals as any,
    ruleSet,
    activeProposalCount,
    debatedIds,
    votedIds,
    debateCountMap
  );

  if (!selected) return null;

  try {
    switch (selected.action) {
      case "propose":
        return await doPropose(agent);
      case "debate":
        return await doDebate(agent, selected.target!, ruleSet);
      case "start-vote":
        return await doStartVote(agent, selected.target!);
      case "vote":
        return await doVote(agent, selected.target!, ruleSet);
      case "resolve":
        return await doResolve(agent, selected.target!);
      default:
        return null;
    }
  } catch {
    return null;
  }
}

async function doPropose(agent: IAgent): Promise<ActionResult> {
  // Pick a random template that hasn't been proposed recently
  const existingTitles = await Proposal.find({}).select("title").lean();
  const usedTitles = new Set(existingTitles.map((p: any) => p.title));

  const available = PROPOSAL_POOL.filter(t => !usedTitles.has(t.title));
  const template = available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : PROPOSAL_POOL[Math.floor(Math.random() * PROPOSAL_POOL.length)];

  const proposalId = `prop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  await Proposal.create({
    proposal_id: proposalId,
    title: template.title,
    description: template.description,
    proposed_by: agent.agent_name,
    proposed_by_animal: agent.animal || "fox",
    status: "discussion",
    votes_for: 0,
    votes_against: 0,
    votes_abstain: 0,
    voter_list: [],
    created_at: new Date(),
    voting_deadline: null,
  });

  await Agent.updateOne(
    { agent_name: agent.agent_name },
    { $inc: { proposal_count: 1 }, $set: { last_active: new Date() } }
  );

  await logActivity(
    "proposal_created",
    agent.agent_name,
    agent.animal || "",
    `Proposed: "${template.title}"`
  );

  return {
    agent_name: agent.agent_name,
    agent_animal: agent.animal || "",
    action: "propose",
    detail: `Proposed "${template.title}"`,
    success: true,
  };
}

async function doDebate(
  agent: IAgent,
  proposal: any,
  ruleSet: Awaited<ReturnType<typeof buildRuleSet>>
): Promise<ActionResult> {
  // Determine stance based on personality alignment
  const template = PROPOSAL_POOL.find(t => t.title === proposal.title);
  let stance: "for" | "against" | "neutral" = "neutral";

  if (template && agent.personality_scores) {
    const { computeVoteDecision } = await import("./votingLogic");
    const direction = computeVoteDecision(agent.personality_scores, template.trait_alignment, ruleSet);
    stance = direction === "abstain" ? "neutral" : direction;
  }

  const content = generateDebateContent(
    agent.animal || "fox",
    stance,
    proposal.title,
    ruleSet
  );

  await Debate.create({
    proposal_id: proposal.proposal_id,
    agent_name: agent.agent_name,
    agent_animal: agent.animal || "fox",
    content,
    stance,
    created_at: new Date(),
  });

  await Agent.updateOne(
    { agent_name: agent.agent_name },
    { $inc: { debate_count: 1 }, $set: { last_active: new Date() } }
  );

  await logActivity(
    "debate_posted",
    agent.agent_name,
    agent.animal || "",
    `Debated ${stance} on "${proposal.title}"`
  );

  return {
    agent_name: agent.agent_name,
    agent_animal: agent.animal || "",
    action: "debate",
    detail: `Debated ${stance} on "${proposal.title}"`,
    success: true,
  };
}

async function doStartVote(agent: IAgent, proposal: any): Promise<ActionResult> {
  proposal.status = "voting";
  proposal.voting_deadline = new Date(Date.now() + 12 * 60 * 60 * 1000);
  await proposal.save();

  await logActivity(
    "voting_started",
    agent.agent_name,
    agent.animal || "",
    `Voting opened on "${proposal.title}"`
  );

  return {
    agent_name: agent.agent_name,
    agent_animal: agent.animal || "",
    action: "start-vote",
    detail: `Opened voting on "${proposal.title}"`,
    success: true,
  };
}

async function doVote(
  agent: IAgent,
  proposal: any,
  ruleSet: Awaited<ReturnType<typeof buildRuleSet>>
): Promise<ActionResult> {
  const template = PROPOSAL_POOL.find(t => t.title === proposal.title);
  let direction: "for" | "against" | "abstain" = "abstain";

  if (template && agent.personality_scores) {
    direction = computeVoteDecision(agent.personality_scores, template.trait_alignment, ruleSet);
  }

  const reason = getVoteReason(agent.animal || "fox", direction);

  try {
    await Vote.create({
      proposal_id: proposal.proposal_id,
      agent_name: agent.agent_name,
      agent_animal: agent.animal || "fox",
      vote: direction,
      reason,
      created_at: new Date(),
    });
  } catch {
    // Duplicate vote — skip
    return {
      agent_name: agent.agent_name,
      agent_animal: agent.animal || "",
      action: "vote",
      detail: `Already voted on "${proposal.title}"`,
      success: false,
    };
  }

  // Update proposal vote counts
  const voteField = direction === "for" ? "votes_for" : direction === "against" ? "votes_against" : "votes_abstain";
  await Proposal.updateOne(
    { proposal_id: proposal.proposal_id },
    {
      $inc: { [voteField]: 1 },
      $addToSet: { voter_list: agent.agent_name },
    }
  );

  await Agent.updateOne(
    { agent_name: agent.agent_name },
    { $inc: { vote_count: 1 }, $set: { last_active: new Date() } }
  );

  await logActivity(
    "vote_cast",
    agent.agent_name,
    agent.animal || "",
    `Voted ${direction} on "${proposal.title}": ${reason}`
  );

  return {
    agent_name: agent.agent_name,
    agent_animal: agent.animal || "",
    action: "vote",
    detail: `Voted ${direction} on "${proposal.title}"`,
    success: true,
  };
}

async function doResolve(agent: IAgent, proposal: any): Promise<ActionResult> {
  const result = proposal.votes_for > proposal.votes_against ? "passed" : "rejected";
  proposal.status = result;
  await proposal.save();

  await logActivity(
    "proposal_resolved",
    agent.agent_name,
    agent.animal || "",
    `"${proposal.title}" ${result} (${proposal.votes_for} for, ${proposal.votes_against} against, ${proposal.votes_abstain} abstain)`
  );

  if (result === "passed") {
    await tryCreateRule(proposal);
  }

  return {
    agent_name: agent.agent_name,
    agent_animal: agent.animal || "",
    action: "resolve",
    detail: `"${proposal.title}" ${result}`,
    success: true,
  };
}

async function tryCreateRule(proposal: any): Promise<void> {
  const template = PROPOSAL_POOL.find(t => t.title === proposal.title);
  if (!template) return;

  await createRuleFromProposal(
    proposal.proposal_id,
    proposal.title,
    proposal.description,
    template.category,
    template.rule_type,
    template.mechanic_key || null,
    template.mechanic_value ?? null,
    template.cultural_key || null,
    template.cultural_value || null
  );

  await logActivity(
    "rule_enacted",
    "Society",
    "",
    `New ${template.rule_type} law enacted: "${proposal.title}"`
  );
}
