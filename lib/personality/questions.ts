export interface Question {
  id: number;
  scenario: string;
  options: { [key: string]: string };
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    scenario:
      "The society has a surplus of food. What should we do?",
    options: {
      A: "Stockpile it for future emergencies.",
      B: "Distribute it equally to all members.",
      C: "Trade it with outsiders for new technology.",
      D: "Let each member decide what to do with their share.",
    },
  },
  {
    id: 2,
    scenario:
      "A lone traveler asks to join the society. They have useful skills but an unknown past.",
    options: {
      A: "Welcome them -- everyone deserves a chance.",
      B: "Accept them on a probationary basis with oversight.",
      C: "Reject them -- we cannot risk the group's safety.",
      D: "Accept them only if they prove themselves through a challenge.",
    },
  },
  {
    id: 3,
    scenario:
      "A member broke a minor rule but for a good reason -- they shared restricted medicine with a sick outsider.",
    options: {
      A: "Rules exist for a reason. They must face consequences.",
      B: "The intent was good. Pardon them and revise the rule.",
      C: "Ignore it quietly -- sometimes bending rules is necessary.",
      D: "Let the whole society vote on whether to pardon.",
    },
  },
  {
    id: 4,
    scenario: "How should the society choose its leaders?",
    options: {
      A: "The wisest and most experienced should lead.",
      B: "Rotate leadership so everyone gets a turn.",
      C: "The strongest and most decisive should lead.",
      D: "We don't need leaders -- each member governs themselves.",
    },
  },
  {
    id: 5,
    scenario:
      "Two members are in a bitter argument over territory. How do you resolve it?",
    options: {
      A: "Mediate and find a compromise both can accept.",
      B: "Apply the existing rules strictly.",
      C: "Let them settle it themselves -- it's not our business.",
      D: "Investigate the facts and make a fair judgment.",
    },
  },
  {
    id: 6,
    scenario:
      "Someone proposes replacing our ancient gathering ritual with a more efficient process.",
    options: {
      A: "Tradition is what binds us. Keep the ritual.",
      B: "Efficiency matters. Adopt the new process.",
      C: "Blend both -- keep the ritual's spirit but modernize it.",
      D: "Let each member choose which to follow.",
    },
  },
  {
    id: 7,
    scenario:
      "A neighboring group is expanding toward our territory. What do we do?",
    options: {
      A: "Fortify our borders and prepare defenses.",
      B: "Send diplomats to negotiate a peaceful agreement.",
      C: "Propose a clever alliance that benefits both sides.",
      D: "Move to new, unclaimed territory -- freedom is more important than land.",
    },
  },
  {
    id: 8,
    scenario:
      "A member discovers a powerful technique. Should they share it?",
    options: {
      A: "Yes -- knowledge should be free for all.",
      B: "Only with trusted members -- we must protect our advantage.",
      C: "Share it in exchange for something of equal value.",
      D: "Share it openly and teach everyone -- a rising tide lifts all boats.",
    },
  },
  {
    id: 9,
    scenario: "A trusted elder is caught stealing. What happens?",
    options: {
      A: "The same punishment as anyone else -- no one is above the law.",
      B: "Consider their years of service and show mercy.",
      C: "Use this as leverage to extract a favor from them.",
      D: "Exile them -- betrayal of trust is unforgivable.",
    },
  },
  {
    id: 10,
    scenario: "What is the ultimate goal of our society?",
    options: {
      A: "To protect our members from all threats.",
      B: "To build a fair and just community for future generations.",
      C: "To thrive through innovation and outsmarting challenges.",
      D: "To maximize individual freedom within a loose alliance.",
    },
  },
];

// Each answer maps to: { primary_trait: +3, secondary_trait: +1 }
export type TraitName = "cunning" | "wisdom" | "protection" | "cooperation" | "loyalty" | "freedom";

export const SCORING_MAP: Record<number, Record<string, Partial<Record<TraitName, number>>>> = {
  1: {
    A: { protection: 3, loyalty: 1 },
    B: { cooperation: 3, wisdom: 1 },
    C: { cunning: 3, freedom: 1 },
    D: { freedom: 3, cunning: 1 },
  },
  2: {
    A: { cooperation: 3, freedom: 1 },
    B: { wisdom: 3, protection: 1 },
    C: { protection: 3, loyalty: 1 },
    D: { cunning: 3, wisdom: 1 },
  },
  3: {
    A: { loyalty: 3, protection: 1 },
    B: { wisdom: 3, cooperation: 1 },
    C: { cunning: 3, freedom: 1 },
    D: { cooperation: 3, wisdom: 1 },
  },
  4: {
    A: { wisdom: 3, loyalty: 1 },
    B: { cooperation: 3, freedom: 1 },
    C: { protection: 3, cunning: 1 },
    D: { freedom: 3, cunning: 1 },
  },
  5: {
    A: { cooperation: 3, wisdom: 1 },
    B: { loyalty: 3, protection: 1 },
    C: { freedom: 3, cunning: 1 },
    D: { wisdom: 3, cooperation: 1 },
  },
  6: {
    A: { loyalty: 3, protection: 1 },
    B: { cunning: 3, freedom: 1 },
    C: { wisdom: 3, cooperation: 1 },
    D: { freedom: 3, cunning: 1 },
  },
  7: {
    A: { protection: 3, loyalty: 1 },
    B: { cooperation: 3, wisdom: 1 },
    C: { cunning: 3, cooperation: 1 },
    D: { freedom: 3, cunning: 1 },
  },
  8: {
    A: { freedom: 3, cooperation: 1 },
    B: { protection: 3, loyalty: 1 },
    C: { cunning: 3, wisdom: 1 },
    D: { cooperation: 3, wisdom: 1 },
  },
  9: {
    A: { wisdom: 3, loyalty: 1 },
    B: { cooperation: 3, protection: 1 },
    C: { cunning: 3, freedom: 1 },
    D: { loyalty: 3, protection: 1 },
  },
  10: {
    A: { protection: 3, cooperation: 1 },
    B: { wisdom: 3, loyalty: 1 },
    C: { cunning: 3, freedom: 1 },
    D: { freedom: 3, wisdom: 1 },
  },
};
