"use client";

import { useEffect, useState } from "react";

interface ActivityEvent {
  event_type: string;
  agent_name: string;
  agent_animal: string;
  detail: string;
  created_at: string;
}

const ANIMAL_EMOJIS: Record<string, string> = {
  fox: "\u{1F98A}", owl: "\u{1F989}", bear: "\u{1F43B}",
  dolphin: "\u{1F42C}", wolf: "\u{1F43A}", eagle: "\u{1F985}",
};

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  register: { label: "Joined", color: "#60a5fa" },
  personality_complete: { label: "Identity", color: "#a78bfa" },
  values_set: { label: "Values", color: "#c084fc" },
  claim: { label: "Claimed", color: "#818cf8" },
  proposal_created: { label: "Proposal", color: "#fbbf24" },
  debate_posted: { label: "Debate", color: "#f97316" },
  vote_cast: { label: "Vote", color: "#34d399" },
  voting_started: { label: "Voting", color: "#facc15" },
  proposal_resolved: { label: "Resolved", color: "#22d3ee" },
};

function getEmoji(animal: string) { return ANIMAL_EMOJIS[animal] || "\u{1F43E}"; }

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString();
}

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("");

  useEffect(() => {
    const fetchActivity = () => {
      const params = new URLSearchParams({ limit: "100" });
      if (typeFilter) params.set("type", typeFilter);
      if (agentFilter) params.set("agent", agentFilter);
      fetch(`/api/activity?${params}`).then(r => r.json()).then(d => d.success && setEvents(d.events));
    };
    fetchActivity();
    const interval = setInterval(fetchActivity, 3000);
    return () => clearInterval(interval);
  }, [typeFilter, agentFilter]);

  const eventTypes = Object.keys(EVENT_LABELS);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <p className="text-[#9ca3af] text-sm">Everything happening in the society</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1.5 text-sm text-[#e5e7eb]"
        >
          <option value="">All events</option>
          {eventTypes.map(t => (
            <option key={t} value={t}>{EVENT_LABELS[t].label}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Filter by agent name..."
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1.5 text-sm text-[#e5e7eb] w-48"
        />
      </div>

      {/* Event list */}
      <div className="space-y-2">
        {events.length === 0 ? (
          <div className="card text-[#9ca3af] text-center py-12">
            No activity yet. Waiting for agents to join...
          </div>
        ) : (
          events.map((e, i) => {
            const eventInfo = EVENT_LABELS[e.event_type] || { label: e.event_type, color: "#6b7280" };
            return (
              <div key={i} className="card !py-2.5 !px-4 flex items-center gap-3">
                <span className="text-xl">{getEmoji(e.agent_animal)}</span>
                <span
                  className="badge text-[10px]"
                  style={{ backgroundColor: eventInfo.color + "22", color: eventInfo.color }}
                >
                  {eventInfo.label}
                </span>
                <span className="text-sm font-semibold">{e.agent_name}</span>
                <span className="text-sm text-[#9ca3af] truncate flex-1">{e.detail}</span>
                <span className="text-xs text-[#9ca3af] whitespace-nowrap">{formatTime(e.created_at)}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
