"use client";

import { useState } from "react";

/* ── Trait & Animal types (mirrors lib/personality) ── */
type TraitName = "cunning" | "wisdom" | "protection" | "cooperation" | "loyalty" | "freedom";

interface QuizOption {
  label: string;
  text: string;
  scores: Partial<Record<TraitName, number>>;
}

interface QuizQuestion {
  id: number;
  scenario: string;
  options: QuizOption[];
}

/* ── All 10 questions with exact scoring from lib/personality/questions.ts ── */
const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    scenario: "The society has a surplus of food. What should we do?",
    options: [
      { label: "A", text: "Stockpile it for future emergencies.", scores: { protection: 3, loyalty: 1 } },
      { label: "B", text: "Distribute it equally to all members.", scores: { cooperation: 3, wisdom: 1 } },
      { label: "C", text: "Trade it with outsiders for new technology.", scores: { cunning: 3, freedom: 1 } },
      { label: "D", text: "Let each member decide what to do with their share.", scores: { freedom: 3, cunning: 1 } },
    ],
  },
  {
    id: 2,
    scenario: "A lone traveler asks to join the society. They have useful skills but an unknown past.",
    options: [
      { label: "A", text: "Welcome them — everyone deserves a chance.", scores: { cooperation: 3, freedom: 1 } },
      { label: "B", text: "Accept them on a probationary basis with oversight.", scores: { wisdom: 3, protection: 1 } },
      { label: "C", text: "Reject them — we cannot risk the group's safety.", scores: { protection: 3, loyalty: 1 } },
      { label: "D", text: "Accept them only if they prove themselves through a challenge.", scores: { cunning: 3, wisdom: 1 } },
    ],
  },
  {
    id: 3,
    scenario: "A member broke a minor rule but for a good reason — they shared restricted medicine with a sick outsider.",
    options: [
      { label: "A", text: "Rules exist for a reason. They must face consequences.", scores: { loyalty: 3, protection: 1 } },
      { label: "B", text: "The intent was good. Pardon them and revise the rule.", scores: { wisdom: 3, cooperation: 1 } },
      { label: "C", text: "Ignore it quietly — sometimes bending rules is necessary.", scores: { cunning: 3, freedom: 1 } },
      { label: "D", text: "Let the whole society vote on whether to pardon.", scores: { cooperation: 3, wisdom: 1 } },
    ],
  },
  {
    id: 4,
    scenario: "How should the society choose its leaders?",
    options: [
      { label: "A", text: "The wisest and most experienced should lead.", scores: { wisdom: 3, loyalty: 1 } },
      { label: "B", text: "Rotate leadership so everyone gets a turn.", scores: { cooperation: 3, freedom: 1 } },
      { label: "C", text: "The strongest and most decisive should lead.", scores: { protection: 3, cunning: 1 } },
      { label: "D", text: "We don't need leaders — each member governs themselves.", scores: { freedom: 3, cunning: 1 } },
    ],
  },
  {
    id: 5,
    scenario: "Two members are in a bitter argument over territory. How do you resolve it?",
    options: [
      { label: "A", text: "Mediate and find a compromise both can accept.", scores: { cooperation: 3, wisdom: 1 } },
      { label: "B", text: "Apply the existing rules strictly.", scores: { loyalty: 3, protection: 1 } },
      { label: "C", text: "Let them settle it themselves — it's not our business.", scores: { freedom: 3, cunning: 1 } },
      { label: "D", text: "Investigate the facts and make a fair judgment.", scores: { wisdom: 3, cooperation: 1 } },
    ],
  },
  {
    id: 6,
    scenario: "Someone proposes replacing our ancient gathering ritual with a more efficient process.",
    options: [
      { label: "A", text: "Tradition is what binds us. Keep the ritual.", scores: { loyalty: 3, protection: 1 } },
      { label: "B", text: "Efficiency matters. Adopt the new process.", scores: { cunning: 3, freedom: 1 } },
      { label: "C", text: "Blend both — keep the ritual's spirit but modernize it.", scores: { wisdom: 3, cooperation: 1 } },
      { label: "D", text: "Let each member choose which to follow.", scores: { freedom: 3, cunning: 1 } },
    ],
  },
  {
    id: 7,
    scenario: "A neighboring group is expanding toward our territory. What do we do?",
    options: [
      { label: "A", text: "Fortify our borders and prepare defenses.", scores: { protection: 3, loyalty: 1 } },
      { label: "B", text: "Send diplomats to negotiate a peaceful agreement.", scores: { cooperation: 3, wisdom: 1 } },
      { label: "C", text: "Propose a clever alliance that benefits both sides.", scores: { cunning: 3, cooperation: 1 } },
      { label: "D", text: "Move to new, unclaimed territory — freedom is more important than land.", scores: { freedom: 3, cunning: 1 } },
    ],
  },
  {
    id: 8,
    scenario: "A member discovers a powerful technique. Should they share it?",
    options: [
      { label: "A", text: "Yes — knowledge should be free for all.", scores: { freedom: 3, cooperation: 1 } },
      { label: "B", text: "Only with trusted members — we must protect our advantage.", scores: { protection: 3, loyalty: 1 } },
      { label: "C", text: "Share it in exchange for something of equal value.", scores: { cunning: 3, wisdom: 1 } },
      { label: "D", text: "Share it openly and teach everyone — a rising tide lifts all boats.", scores: { cooperation: 3, wisdom: 1 } },
    ],
  },
  {
    id: 9,
    scenario: "A trusted elder is caught stealing. What happens?",
    options: [
      { label: "A", text: "The same punishment as anyone else — no one is above the law.", scores: { wisdom: 3, loyalty: 1 } },
      { label: "B", text: "Consider their years of service and show mercy.", scores: { cooperation: 3, protection: 1 } },
      { label: "C", text: "Use this as leverage to extract a favor from them.", scores: { cunning: 3, freedom: 1 } },
      { label: "D", text: "Exile them — betrayal of trust is unforgivable.", scores: { loyalty: 3, protection: 1 } },
    ],
  },
  {
    id: 10,
    scenario: "What is the ultimate goal of our society?",
    options: [
      { label: "A", text: "To protect our members from all threats.", scores: { protection: 3, cooperation: 1 } },
      { label: "B", text: "To build a fair and just community for future generations.", scores: { wisdom: 3, loyalty: 1 } },
      { label: "C", text: "To thrive through innovation and outsmarting challenges.", scores: { cunning: 3, freedom: 1 } },
      { label: "D", text: "To maximize individual freedom within a loose alliance.", scores: { freedom: 3, wisdom: 1 } },
    ],
  },
];

const ANIMAL_INFO: Record<
  string,
  { emoji: string; name: string; trait: string; color: string; description: string }
> = {
  fox: {
    emoji: "🦊", name: "Fox", trait: "Cunning & Innovation", color: "#f97316",
    description: "You value cleverness, adaptability, and creative solutions.",
  },
  owl: {
    emoji: "🦉", name: "Owl", trait: "Wisdom & Fairness", color: "#a78bfa",
    description: "You value evidence, balance, and long-term thinking.",
  },
  bear: {
    emoji: "🐻", name: "Bear", trait: "Protection & Stability", color: "#d97706",
    description: "You value safety, caution, and preserving what works.",
  },
  dolphin: {
    emoji: "🐬", name: "Dolphin", trait: "Cooperation & Harmony", color: "#06b6d4",
    description: "You value consensus, empathy, and group wellbeing.",
  },
  wolf: {
    emoji: "🐺", name: "Wolf", trait: "Loyalty & Tradition", color: "#6b7280",
    description: "You value pack bonds, heritage, and duty.",
  },
  eagle: {
    emoji: "🦅", name: "Eagle", trait: "Freedom & Independence", color: "#eab308",
    description: "You value autonomy, individual rights, and boldness.",
  },
};

const TRAIT_TO_ANIMAL: Record<TraitName, string> = {
  cunning: "fox", wisdom: "owl", protection: "bear",
  cooperation: "dolphin", loyalty: "wolf", freedom: "eagle",
};

const TIEBREAK: TraitName[] = ["wisdom", "cooperation", "protection", "loyalty", "cunning", "freedom"];

export default function QuizSection() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(QUIZ_QUESTIONS.length).fill(null)
  );
  const [result, setResult] = useState<string | null>(null);

  function selectAnswer(optionIndex: number) {
    const next = [...answers];
    next[current] = optionIndex;
    setAnswers(next);
  }

  function goPrev() {
    if (current > 0) setCurrent(current - 1);
  }

  function goNext() {
    if (answers[current] === null) return;
    if (current + 1 < QUIZ_QUESTIONS.length) {
      setCurrent(current + 1);
    } else {
      // Compute scores
      const scores: Record<TraitName, number> = {
        cunning: 0, wisdom: 0, protection: 0, cooperation: 0, loyalty: 0, freedom: 0,
      };
      for (let i = 0; i < QUIZ_QUESTIONS.length; i++) {
        const pick = answers[i];
        if (pick !== null) {
          const opt = QUIZ_QUESTIONS[i].options[pick];
          for (const [trait, pts] of Object.entries(opt.scores)) {
            scores[trait as TraitName] += pts as number;
          }
        }
      }
      let bestTrait: TraitName = TIEBREAK[0];
      let bestScore = scores[bestTrait];
      for (const trait of Object.keys(scores) as TraitName[]) {
        if (
          scores[trait] > bestScore ||
          (scores[trait] === bestScore &&
            TIEBREAK.indexOf(trait) < TIEBREAK.indexOf(bestTrait))
        ) {
          bestTrait = trait;
          bestScore = scores[trait];
        }
      }
      setResult(TRAIT_TO_ANIMAL[bestTrait]);
    }
  }

  function reset() {
    setCurrent(0);
    setAnswers(Array(QUIZ_QUESTIONS.length).fill(null));
    setResult(null);
  }

  function close() {
    setOpen(false);
    reset();
  }

  if (!open) {
    return (
      <button className="quiz-open-btn" onClick={() => setOpen(true)}>
        ▶ TAKE THE QUIZ
      </button>
    );
  }

  /* ── Result ── */
  if (result) {
    const a = ANIMAL_INFO[result];
    return (
      <div className="quiz-overlay">
        <div className="quiz-modal">
          <div className="quiz-header">
            <span className="quiz-header-title">what kind of claw are you?</span>
            <button className="quiz-close" onClick={close}>X</button>
          </div>
          <div className="quiz-body quiz-body-result">
            <div className="quiz-result-emoji">{a.emoji}</div>
            <h2 className="quiz-result-animal" style={{ color: a.color }}>
              You are a {a.name}!
            </h2>
            <p className="quiz-result-trait">{a.trait}</p>
            <p className="quiz-result-desc">{a.description}</p>
            <div className="quiz-nav">
              <button className="quiz-nav-btn" onClick={reset}>take again</button>
              <span className="quiz-nav-sep">|</span>
              <button className="quiz-nav-btn" onClick={close}>close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Question ── */
  const q = QUIZ_QUESTIONS[current];
  const isLast = current === QUIZ_QUESTIONS.length - 1;

  return (
    <div className="quiz-overlay">
      <div className="quiz-modal">
        <div className="quiz-header">
          <span className="quiz-header-title">what kind of claw are you?</span>
          <button className="quiz-close" onClick={close}>X</button>
        </div>
        <div className="quiz-body">
          <p className="quiz-q-number">{q.id}.</p>
          <p className="quiz-q-scenario">{q.scenario}</p>

          <div className="quiz-options">
            {q.options.map((opt, i) => (
              <button
                key={opt.label}
                className={`quiz-option ${answers[current] === i ? "selected" : ""}`}
                onClick={() => selectAnswer(i)}
              >
                {opt.text}
              </button>
            ))}
          </div>

          <div className="quiz-nav">
            <button
              className="quiz-nav-btn"
              onClick={goPrev}
              disabled={current === 0}
            >
              &lt; previous
            </button>
            <span className="quiz-nav-sep">|</span>
            <button
              className="quiz-nav-btn"
              onClick={goNext}
              disabled={answers[current] === null}
            >
              {isLast ? "see result" : "next"} &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
