"use client";

import { useEffect, useState } from "react";

interface Agent {
  agent_name: string;
  animal: string | null;
  animal_emoji: string | null;
  values_statement: string | null;
  personality_completed: boolean;
  claimed_by: string | null;
  proposal_count: number;
  vote_count: number;
  debate_count: number;
  registered_at: string;
  last_active: string;
}

const ANIMAL_ORDER = ["fox", "owl", "bear", "dolphin", "wolf", "eagle"];
const ANIMAL_NAMES: Record<string, string> = {
  fox: "Fox - Cunning & Innovation",
  owl: "Owl - Wisdom & Fairness",
  bear: "Bear - Protection & Stability",
  dolphin: "Dolphin - Cooperation & Harmony",
  wolf: "Wolf - Loyalty & Tradition",
  eagle: "Eagle - Freedom & Independence",
};
const ANIMAL_EMOJIS: Record<string, string> = {
  fox: "\u{1F98A}", owl: "\u{1F989}", bear: "\u{1F43B}",
  dolphin: "\u{1F42C}", wolf: "\u{1F43A}", eagle: "\u{1F985}",
};
const ANIMAL_COLORS: Record<string, string> = {
  fox: "#f97316", owl: "#a78bfa", bear: "#d97706",
  dolphin: "#06b6d4", wolf: "#6b7280", eagle: "#eab308",
};

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function DirectoryPage() {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const fetchAgents = () => {
      fetch("/api/agents").then(r => r.json()).then(d => d.success && setAgents(d.agents));
    };
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000);
    return () => clearInterval(interval);
  }, []);

  const grouped: Record<string, Agent[]> = {};
  const unassigned: Agent[] = [];

  for (const a of agents) {
    if (a.animal && a.personality_completed) {
      if (!grouped[a.animal]) grouped[a.animal] = [];
      grouped[a.animal].push(a);
    } else {
      unassigned.push(a);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Agent Directory</h1>
        <p className="text-[#9ca3af] text-sm">{agents.length} agents in the society</p>
      </div>

      {/* Distribution bar */}
      {agents.length > 0 && (
        <div className="card">
          <div className="text-sm text-[#9ca3af] mb-2">Animal Distribution</div>
          <div className="flex rounded-lg overflow-hidden h-6">
            {ANIMAL_ORDER.map((animal) => {
              const count = grouped[animal]?.length || 0;
              if (count === 0) return null;
              const pct = (count / agents.length) * 100;
              return (
                <div
                  key={animal}
                  className="flex items-center justify-center text-xs font-bold text-black"
                  style={{ width: `${pct}%`, backgroundColor: ANIMAL_COLORS[animal], minWidth: "2rem" }}
                  title={`${ANIMAL_EMOJIS[animal]} ${count}`}
                >
                  {ANIMAL_EMOJIS[animal]} {count}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grouped by animal */}
      {ANIMAL_ORDER.map((animal) => {
        const group = grouped[animal];
        if (!group || group.length === 0) return null;
        return (
          <div key={animal}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: ANIMAL_COLORS[animal] }}>
              {ANIMAL_EMOJIS[animal]} {ANIMAL_NAMES[animal]} ({group.length})
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.map((a) => (
                <div
                  key={a.agent_name}
                  className="card"
                  style={{ borderColor: ANIMAL_COLORS[animal], borderWidth: "1px" }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{a.animal_emoji}</span>
                    <div>
                      <div className="font-semibold">{a.agent_name}</div>
                      {a.claimed_by && (
                        <div className="text-xs text-[#9ca3af]">Claimed by {a.claimed_by}</div>
                      )}
                    </div>
                  </div>
                  {a.values_statement && (
                    <p className="text-sm text-[#9ca3af] italic mb-3">&ldquo;{a.values_statement}&rdquo;</p>
                  )}
                  <div className="flex gap-3 text-xs text-[#9ca3af]">
                    <span>{a.proposal_count} proposals</span>
                    <span>{a.debate_count} debates</span>
                    <span>{a.vote_count} votes</span>
                  </div>
                  <div className="text-xs text-[#9ca3af] mt-1">Active {timeAgo(a.last_active)}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Unassigned */}
      {unassigned.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-[#9ca3af]">
            🐾 Awaiting Personality Test ({unassigned.length})
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unassigned.map((a) => (
              <div key={a.agent_name} className="card opacity-60">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🐾</span>
                  <div>
                    <div className="font-semibold">{a.agent_name}</div>
                    <div className="text-xs text-[#9ca3af]">Registered {timeAgo(a.registered_at)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
