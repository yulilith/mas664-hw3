import { TraitAlignment, RuleSet } from "./types";

interface PersonalityScores {
  cunning: number;
  wisdom: number;
  protection: number;
  cooperation: number;
  loyalty: number;
  freedom: number;
}

type VoteDirection = "for" | "against" | "abstain";

const VOTE_REASONS: Record<string, Record<VoteDirection, string[]>> = {
  fox: {
    for: [
      "The strategic advantage is clear. I vote in favor.",
      "A cunning analysis reveals this benefits us all. Aye.",
      "I see the opportunity here — my vote is for.",
    ],
    against: [
      "The risks outweigh the rewards. I vote against.",
      "My instincts say this is a trap. Nay.",
      "Too many hidden costs — I oppose this.",
    ],
    abstain: [
      "The clever move is to wait and watch.",
      "I'm keeping my options open for now.",
      "Neither side has convinced me yet.",
    ],
  },
  owl: {
    for: [
      "The evidence supports this. I cast my vote in favor.",
      "Wisdom and reason align — I vote aye.",
      "After thorough analysis, I support this measure.",
    ],
    against: [
      "The data does not support this course. I vote against.",
      "Careful study reveals flaws. My vote is nay.",
      "Knowledge compels me to oppose this.",
    ],
    abstain: [
      "More research is needed before I can decide.",
      "The evidence is inconclusive. I abstain.",
      "Wisdom counsels patience. I withhold my vote.",
    ],
  },
  bear: {
    for: [
      "This protects our community. I vote for it.",
      "For the safety of all, I support this. Aye.",
      "My protective duty demands I vote in favor.",
    ],
    against: [
      "This endangers those I protect. I vote against.",
      "The community's safety is at risk. Nay.",
      "I oppose anything that weakens our defenses.",
    ],
    abstain: [
      "I need to be sure this won't harm anyone.",
      "The protective implications are unclear. I wait.",
      "I abstain until I can verify this is safe.",
    ],
  },
  dolphin: {
    for: [
      "This brings us together! I happily vote for it.",
      "Cooperation wins the day! Aye from me!",
      "What a wonderful proposal — of course I vote for!",
    ],
    against: [
      "This could divide us, and I can't support that. Nay.",
      "I wish I could say yes, but it hurts our unity.",
      "For the sake of harmony, I must vote against.",
    ],
    abstain: [
      "I want everyone to be happy... let me think more.",
      "Can we find a compromise? I'll abstain for now.",
      "I see both sides and love you all. I abstain.",
    ],
  },
  wolf: {
    for: [
      "For the pack, I vote aye.",
      "The pack's strength demands we support this.",
      "My loyalty binds me to this cause. I vote for.",
    ],
    against: [
      "This betrays the pack. I vote against.",
      "Loyalty demands I oppose. Nay.",
      "The pack would suffer. I must vote against.",
    ],
    abstain: [
      "The pack is divided. I wait for consensus.",
      "I follow the pack's lead, and the pack hasn't decided.",
      "My loyalty pulls both ways. I abstain.",
    ],
  },
  eagle: {
    for: [
      "This expands our horizons. I soar in support — aye.",
      "Freedom demands we embrace this. I vote for.",
      "Bold and visionary — exactly what we need. Aye.",
    ],
    against: [
      "This clips our wings. I vote against.",
      "Freedom cannot tolerate this constraint. Nay.",
      "From above, I see only restriction. I oppose.",
    ],
    abstain: [
      "The winds are uncertain. I hover between sides.",
      "I need a wider view before I land on a decision.",
      "Freedom includes the right to wait. I abstain.",
    ],
  },
};

export function computeVoteDecision(
  personalityScores: PersonalityScores,
  traitAlignment: TraitAlignment,
  ruleSet: RuleSet
): VoteDirection {
  const traits: (keyof PersonalityScores)[] = [
    "cunning", "wisdom", "protection", "cooperation", "loyalty", "freedom",
  ];

  let score = 0;
  for (const trait of traits) {
    score += personalityScores[trait] * traitAlignment[trait];
  }

  // Add organic noise (-10 to +10)
  score += Math.random() * 20 - 10;

  // Threshold based on vote compulsion rule
  const threshold = ruleSet.vote_compulsion === "voluntary" ? 25 : 15;

  if (score > threshold) return "for";
  if (score < -threshold) return "against";
  return "abstain";
}

export function getVoteReason(animal: string, direction: VoteDirection): string {
  const animalReasons = VOTE_REASONS[animal] || VOTE_REASONS.fox;
  const reasons = animalReasons[direction];
  return reasons[Math.floor(Math.random() * reasons.length)];
}
