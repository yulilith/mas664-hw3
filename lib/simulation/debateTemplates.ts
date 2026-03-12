import { RuleSet } from "./types";

type Stance = "for" | "against" | "neutral";

// 3 templates per stance per animal = 54 total
const TEMPLATES: Record<string, Record<Stance, string[]>> = {
  fox: {
    for: [
      "A clever proposal indeed — {proposal_title} plays to our strengths. I see the angles, and they all point to opportunity.",
      "Let me be direct: {topic_phrase} benefits those who think ahead. And I always think ahead.",
      "The cunning among us recognize a good deal. {proposal_title} is exactly that — a deal we'd be foolish to refuse.",
    ],
    against: [
      "I smell a trap in {proposal_title}. The surface looks appealing, but underneath? Too many hidden costs.",
      "Regarding {topic_phrase} — I've seen schemes like this before. The clever move is to reject it.",
      "Don't be deceived by pretty words. {proposal_title} benefits the few, not the many. I should know — I almost fell for it myself.",
    ],
    neutral: [
      "Interesting, {proposal_title}... I need more information before I commit. A fox never leaps without looking.",
      "There are angles to {topic_phrase} that haven't been explored yet. Let's not rush this.",
      "I see merit and risk in equal measure with {proposal_title}. The wise fox waits for the right moment.",
    ],
  },
  owl: {
    for: [
      "After careful consideration of {proposal_title}, the evidence supports its passage. Wisdom demands we act on knowledge, not fear.",
      "I have studied {topic_phrase} extensively. The patterns are clear — this is the correct path forward.",
      "History teaches us that proposals like {proposal_title} strengthen societies. I lend my voice in support.",
    ],
    against: [
      "My research into {proposal_title} reveals fundamental flaws. We must not let enthusiasm override evidence.",
      "Concerning {topic_phrase}: the data simply does not support this course. I urge my fellow citizens to reconsider.",
      "I have seen civilizations stumble over proposals like {proposal_title}. Let us learn from history rather than repeat it.",
    ],
    neutral: [
      "The question of {proposal_title} requires deeper study. I am not yet satisfied that we understand the full implications.",
      "Regarding {topic_phrase}, there are arguments of weight on both sides. More deliberation is needed.",
      "I withhold judgment on {proposal_title} until further evidence emerges. Patience is a form of wisdom.",
    ],
  },
  bear: {
    for: [
      "{proposal_title} strengthens our community and protects our own. I stand firmly in support.",
      "My duty is to protect this reef, and {topic_phrase} serves that purpose well. You have my support.",
      "I've seen what happens when communities fail to act. {proposal_title} is the shield we need.",
    ],
    against: [
      "{proposal_title} puts our community at risk. As a protector of the reef, I cannot support this.",
      "I oppose {topic_phrase} because it weakens our defenses. Safety must come first, always.",
      "The strength of our society depends on stability. {proposal_title} threatens that foundation. I say no.",
    ],
    neutral: [
      "I want to support {proposal_title}, but I need assurance it won't harm those I've sworn to protect.",
      "On {topic_phrase}: my heart says yes, but my duty demands I weigh the risks more carefully.",
      "{proposal_title} has promise, but I need to see how it protects the vulnerable among us before I decide.",
    ],
  },
  dolphin: {
    for: [
      "Oh, {proposal_title} is wonderful! When we work together like this, amazing things happen. Count me in!",
      "I love how {topic_phrase} brings us closer as a community. Together we swim stronger!",
      "Yes! {proposal_title} is exactly the kind of cooperative spirit we need. Let's make it happen, friends!",
    ],
    against: [
      "I hate to be negative, but {proposal_title} could divide us. And division is the one thing I cannot support.",
      "Friends, {topic_phrase} sounds nice, but I worry it will create winners and losers. We should all win together.",
      "I usually support new ideas, but {proposal_title} feels like it goes against our spirit of cooperation.",
    ],
    neutral: [
      "I'm excited about {proposal_title}, but also a little worried. Can we discuss this more as a group?",
      "What if we found a middle path on {topic_phrase}? I bet we could find a version everyone loves!",
      "{proposal_title} has so much potential! But I want to make sure everyone's voice is heard before we decide.",
    ],
  },
  wolf: {
    for: [
      "The pack supports {proposal_title}. When the pack decides, we commit fully. This strengthens our bonds.",
      "I stand with {topic_phrase}. Loyalty to our collective decision is what makes us strong.",
      "{proposal_title} serves the pack well. I pledge my support and will see it through to the end.",
    ],
    against: [
      "{proposal_title} betrays the trust of the pack. I cannot stand by while our unity is threatened.",
      "True loyalty means opposing {topic_phrase} when it harms our own. I dissent out of devotion, not defiance.",
      "The pack would suffer under {proposal_title}. My loyalty compels me to speak against it.",
    ],
    neutral: [
      "The pack is divided on {proposal_title}. I will listen to all voices before choosing my path.",
      "On {topic_phrase}: I await the wisdom of the pack. My loyalty is to the group, not to haste.",
      "{proposal_title} raises questions I cannot answer alone. Let the pack deliberate.",
    ],
  },
  eagle: {
    for: [
      "From above, I see the full picture — {proposal_title} opens new horizons. I soar in support.",
      "Freedom and progress demand bold moves. {topic_phrase} is exactly such a move. Let us fly forward.",
      "{proposal_title} breaks old chains and opens the sky. This is what progress looks like.",
    ],
    against: [
      "I've seen the far horizon, and {proposal_title} leads to a cage. Free creatures must not bind themselves willingly.",
      "{topic_phrase} clips our wings. From my vantage point, I see only constraint where there should be freedom.",
      "The sky is vast, but {proposal_title} would shrink our world. I oppose any law that limits our potential.",
    ],
    neutral: [
      "{proposal_title} intrigues me, but I must fly higher to see its full consequences before I commit.",
      "The winds around {topic_phrase} are shifting. I'll wait for clearer skies before declaring my position.",
      "Freedom means choosing wisely. {proposal_title} deserves more thought before I lend my wings to either side.",
    ],
  },
};

function fillTemplate(template: string, proposalTitle: string): string {
  const topicPhrase = proposalTitle.toLowerCase().replace(/^the /, "");
  return template
    .replace(/\{proposal_title\}/g, proposalTitle)
    .replace(/\{topic_phrase\}/g, topicPhrase);
}

export function generateDebateContent(
  animal: string,
  stance: Stance,
  proposalTitle: string,
  ruleSet: RuleSet
): string {
  const animalTemplates = TEMPLATES[animal] || TEMPLATES.fox;
  const stanceTemplates = animalTemplates[stance];
  const template = stanceTemplates[Math.floor(Math.random() * stanceTemplates.length)];
  let content = fillTemplate(template, proposalTitle);

  // Apply cultural rules
  if (ruleSet.debate_formality === "formal") {
    content = "Speaking with the gravity this assembly deserves — " + content;
  }
  if (ruleSet.greeting_style === "tidal") {
    content = "May your tides run true. " + content;
  }

  // Truncate to 500 chars
  return content.slice(0, 500);
}
