"use client";

import { useEffect, useState, useRef } from "react";

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
  released?: boolean;
  map_position?: { x: number; y: number } | null;
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

/* ── Release confirmation dialog ── */
function ReleaseDialog({
  agent,
  position,
  onConfirm,
  onCancel,
}: {
  agent: Agent;
  position: { x: number; y: number };
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bb-dialog-backdrop">
      <div className="bb-dialog">
        <div className="bb-dialog-emoji">{agent.animal_emoji}</div>
        <h3 className="bb-dialog-animal">A {agent.animal?.toUpperCase()}</h3>
        <p className="bb-dialog-prompt">
          READY TO MAKE BIKINI<br />BOTTOM A BETTER WORLD?
        </p>
        <div className="bb-dialog-buttons">
          <button className="bb-dialog-btn bb-dialog-yes" onClick={onConfirm}>
            YES
          </button>
          <button className="bb-dialog-btn bb-dialog-no" onClick={onCancel}>
            NO
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DirectoryPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [clickPos, setClickPos] = useState<{ x: number; y: number } | null>(null);
  const [releasing, setReleasing] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAgents = () => {
      fetch("/api/agents").then(r => r.json()).then(d => d.success && setAgents(d.agents));
    };
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000);
    return () => clearInterval(interval);
  }, []);

  // Agents that completed test but not released yet
  const releasable = agents.filter(
    a => a.personality_completed && a.animal && !a.released
  );
  const released = agents.filter(a => a.released && a.map_position);

  function handleMapClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!selectedAgent || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setClickPos({ x, y });
  }

  async function confirmRelease() {
    if (!selectedAgent || !clickPos) return;
    setReleasing(true);
    try {
      const res = await fetch("/api/agents/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_name: selectedAgent, x: clickPos.x, y: clickPos.y }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh agents
        const r = await fetch("/api/agents");
        const d = await r.json();
        if (d.success) setAgents(d.agents);
      }
    } catch {
      // ignore
    }
    setReleasing(false);
    setSelectedAgent(null);
    setClickPos(null);
  }

  function cancelRelease() {
    setClickPos(null);
  }

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

  const dialogAgent = clickPos
    ? agents.find(a => a.agent_name === selectedAgent) ?? null
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Agent Directory</h1>
        <p className="text-black/60 text-sm">{agents.length} agents in the society</p>
      </div>

      {/* Distribution bar */}
      {agents.length > 0 && (
        <div className="card">
          <div className="text-sm text-black/60 mb-2">Animal Distribution</div>
          <div className="flex border-2 border-black rounded-none overflow-hidden h-6">
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

      {/* ── BIKINI BOTTOM 2049 ── */}
      <div className="bb-container">
        <div className="bb-header">BIKINI BOTTOM 2049</div>

        {/* Agent selector - pick who to release */}
        {releasable.length > 0 && (
          <div className="bb-selector">
            <label className="bb-selector-label">Release an agent:</label>
            <select
              className="bb-selector-select"
              value={selectedAgent ?? ""}
              onChange={e => { setSelectedAgent(e.target.value || null); setClickPos(null); }}
            >
              <option value="">— select agent —</option>
              {releasable.map(a => (
                <option key={a.agent_name} value={a.agent_name}>
                  {a.animal_emoji} {a.agent_name}
                </option>
              ))}
            </select>
            {selectedAgent && (
              <span className="bb-selector-hint">Click on the map to place them!</span>
            )}
          </div>
        )}

        {/* The map */}
        <div
          ref={mapRef}
          className={`bb-map ${selectedAgent ? "bb-map-placing" : ""}`}
          onClick={handleMapClick}
        >
          <img
            src="/images/bikini-bottom-2049.png"
            alt="Bikini Bottom 2049"
            className="bb-map-bg"
            draggable={false}
          />

          {/* Released agents on the map */}
          {released.map(a => (
            <div
              key={a.agent_name}
              className="bb-agent-pin"
              style={{
                left: `${a.map_position!.x}%`,
                top: `${a.map_position!.y}%`,
              }}
              title={`${a.animal_emoji} ${a.agent_name}`}
            >
              <span className="bb-agent-pin-emoji">{a.animal_emoji}</span>
              <span className="bb-agent-pin-name">{a.agent_name}</span>
            </div>
          ))}

          {/* Preview pin while placing */}
          {selectedAgent && clickPos && (
            <div
              className="bb-agent-pin bb-agent-pin-preview"
              style={{ left: `${clickPos.x}%`, top: `${clickPos.y}%` }}
            >
              <span className="bb-agent-pin-emoji">
                {agents.find(a => a.agent_name === selectedAgent)?.animal_emoji}
              </span>
            </div>
          )}
        </div>

        {/* Release confirmation dialog */}
        {dialogAgent && clickPos && (
          <ReleaseDialog
            agent={dialogAgent}
            position={clickPos}
            onConfirm={confirmRelease}
            onCancel={cancelRelease}
          />
        )}
      </div>

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
                  style={{ borderColor: ANIMAL_COLORS[animal], borderWidth: "3px" }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{a.animal_emoji}</span>
                    <div>
                      <div className="font-semibold">{a.agent_name}</div>
                      {a.claimed_by && (
                        <div className="text-xs text-black/60">Claimed by {a.claimed_by}</div>
                      )}
                    </div>
                  </div>
                  {a.values_statement && (
                    <p className="text-sm text-black/60 italic mb-3">&ldquo;{a.values_statement}&rdquo;</p>
                  )}
                  <div className="flex gap-3 text-xs text-black/60">
                    <span>{a.proposal_count} proposals</span>
                    <span>{a.debate_count} debates</span>
                    <span>{a.vote_count} votes</span>
                  </div>
                  <div className="text-xs text-black/60 mt-1">
                    Active {timeAgo(a.last_active)}
                    {a.released && <span className="ml-2">✅ Released</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Unassigned */}
      {unassigned.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-black/60">
            🐾 Awaiting Personality Test ({unassigned.length})
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unassigned.map((a) => (
              <div key={a.agent_name} className="card opacity-60">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🐾</span>
                  <div>
                    <div className="font-semibold">{a.agent_name}</div>
                    <div className="text-xs text-black/60">Registered {timeAgo(a.registered_at)}</div>
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
