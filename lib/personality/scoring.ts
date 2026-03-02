import { SCORING_MAP, type TraitName } from "./questions";

export const TRAIT_AXES: TraitName[] = [
  "cunning",
  "wisdom",
  "protection",
  "cooperation",
  "loyalty",
  "freedom",
];

export const ANIMAL_MAP: Record<TraitName, string> = {
  cunning: "fox",
  wisdom: "owl",
  protection: "bear",
  cooperation: "dolphin",
  loyalty: "wolf",
  freedom: "eagle",
};

export const ANIMAL_INFO: Record<
  string,
  { emoji: string; name: string; trait: string; description: string; debate_style: string }
> = {
  fox: {
    emoji: "\u{1F98A}",
    name: "Fox",
    trait: "Cunning & Innovation",
    description: "You value cleverness, adaptability, and creative solutions.",
    debate_style: "Finds loopholes and reframes problems creatively.",
  },
  owl: {
    emoji: "\u{1F989}",
    name: "Owl",
    trait: "Wisdom & Fairness",
    description: "You value evidence, balance, and long-term thinking.",
    debate_style: "Cites precedent and weighs both sides carefully.",
  },
  bear: {
    emoji: "\u{1F43B}",
    name: "Bear",
    trait: "Protection & Stability",
    description: "You value safety, caution, and preserving what works.",
    debate_style: "Defends the status quo and is risk-averse.",
  },
  dolphin: {
    emoji: "\u{1F42C}",
    name: "Dolphin",
    trait: "Cooperation & Harmony",
    description: "You value consensus, empathy, and group wellbeing.",
    debate_style: "Seeks compromise and mediates between sides.",
  },
  wolf: {
    emoji: "\u{1F43A}",
    name: "Wolf",
    trait: "Loyalty & Tradition",
    description: "You value pack bonds, heritage, and duty.",
    debate_style: "Appeals to history and in-group bonds.",
  },
  eagle: {
    emoji: "\u{1F985}",
    name: "Eagle",
    trait: "Freedom & Independence",
    description: "You value autonomy, individual rights, and boldness.",
    debate_style: "Champions liberty and resists control.",
  },
};

// Tiebreak: prosocial traits first
const TIEBREAK_ORDER: TraitName[] = [
  "wisdom",
  "cooperation",
  "protection",
  "loyalty",
  "cunning",
  "freedom",
];

export interface Scores {
  cunning: number;
  wisdom: number;
  protection: number;
  cooperation: number;
  loyalty: number;
  freedom: number;
}

export function computeScores(answers: Record<string, string>): Scores {
  const scores: Scores = {
    cunning: 0,
    wisdom: 0,
    protection: 0,
    cooperation: 0,
    loyalty: 0,
    freedom: 0,
  };

  for (const [qIdStr, option] of Object.entries(answers)) {
    const qId = parseInt(qIdStr, 10);
    const mapping = SCORING_MAP[qId]?.[option.toUpperCase()];
    if (mapping) {
      for (const [trait, points] of Object.entries(mapping)) {
        scores[trait as TraitName] += points as number;
      }
    }
  }

  return scores;
}

export function computeAnimal(scores: Scores): string {
  let bestTrait: TraitName = TIEBREAK_ORDER[0];
  let bestScore = scores[bestTrait];

  for (const trait of TRAIT_AXES) {
    if (
      scores[trait] > bestScore ||
      (scores[trait] === bestScore &&
        TIEBREAK_ORDER.indexOf(trait) < TIEBREAK_ORDER.indexOf(bestTrait))
    ) {
      bestTrait = trait;
      bestScore = scores[trait];
    }
  }

  return ANIMAL_MAP[bestTrait];
}
