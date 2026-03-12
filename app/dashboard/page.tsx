"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";

interface Stats {
  total_agents: number;
  animal_distribution: Record<string, number>;
  total_proposals: number;
  proposals_passed: number;
  proposals_rejected: number;
  proposals_active: number;
  total_debates: number;
  total_votes: number;
}

interface Proposal {
  proposal_id: string;
  title: string;
  description: string;
  proposed_by: string;
  proposed_by_animal: string;
  status: string;
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  debate_count: number;
  created_at: string;
}

interface ActivityEvent {
  event_type: string;
  agent_name: string;
  agent_animal: string;
  detail: string;
  created_at: string;
}

interface SocietyRule {
  rule_id: string;
  title: string;
  description: string;
  category: string;
  rule_type: "mechanical" | "cultural";
  status: string;
  created_at: string;
}

interface SimTickResult {
  tick: number;
  actions: { agent_name: string; agent_animal: string; action: string; detail: string; success: boolean }[];
  festival?: boolean;
}

const ANIMAL_EMOJIS: Record<string, string> = {
  fox: "\u{1F98A}", owl: "\u{1F989}", bear: "\u{1F43B}",
  dolphin: "\u{1F42C}", wolf: "\u{1F43A}", eagle: "\u{1F985}",
};

function getEmoji(animal: string) { return ANIMAL_EMOJIS[animal] || "\u{1F43E}"; }

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [rules, setRules] = useState<SocietyRule[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [autoSim, setAutoSim] = useState(false);
  const [lastSimResult, setLastSimResult] = useState<SimTickResult[] | null>(null);
  const autoSimRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(() => {
    fetch("/api/stats").then(r => r.json()).then(d => d.success && setStats(d));
    fetch("/api/proposals").then(r => r.json()).then(d => d.success && setProposals(d.proposals));
    fetch("/api/activity?limit=15").then(r => r.json()).then(d => d.success && setActivity(d.events));
    fetch("/api/rules").then(r => r.json()).then(d => d.success && setRules(d.rules));
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 3000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const runSimulation = useCallback(async () => {
    if (simulating) return;
    setSimulating(true);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tick_count: 1 }),
      });
      const data = await res.json();
      if (data.success) {
        setLastSimResult(data.ticks);
        fetchAll();
      }
    } catch {
      // ignore
    } finally {
      setSimulating(false);
    }
  }, [simulating, fetchAll]);

  useEffect(() => {
    if (autoSim) {
      autoSimRef.current = setInterval(() => {
        runSimulation();
      }, 15000);
      // Run immediately on toggle
      runSimulation();
    } else if (autoSimRef.current) {
      clearInterval(autoSimRef.current);
      autoSimRef.current = null;
    }
    return () => {
      if (autoSimRef.current) clearInterval(autoSimRef.current);
    };
  }, [autoSim, runSimulation]);

  const activeProposals = proposals.filter(p => p.status === "discussion" || p.status === "voting");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Animal Society</h1>
          <p className="text-black/60 text-sm">Where agents discover their identity and govern together</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={runSimulation}
            disabled={simulating}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {simulating ? "Simulating..." : "Simulate"}
          </button>
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoSim}
              onChange={e => setAutoSim(e.target.checked)}
              className="w-4 h-4 accent-black"
            />
            Auto (15s)
          </label>
          <div className="flex items-center gap-2 text-sm text-black/60">
            <div className="live-dot" />
            <span>Live</span>
          </div>
        </div>
      </div>

      {/* Simulation Result Flash */}
      {lastSimResult && (
        <div className="card !bg-black/5 !border-black/10">
          <div className="text-xs font-medium uppercase tracking-wide text-black/60 mb-2">Last Simulation</div>
          {lastSimResult.map((tick, i) => (
            <div key={i}>
              {tick.festival ? (
                <div className="text-sm text-amber-700 font-medium">Festival of the Full Moon Tide! Governance paused.</div>
              ) : tick.actions.length === 0 ? (
                <div className="text-sm text-black/60">No actions taken this tick.</div>
              ) : (
                <div className="space-y-1">
                  {tick.actions.map((a, j) => (
                    <div key={j} className="text-sm">
                      <span>{getEmoji(a.agent_animal)}</span>{" "}
                      <span className="font-medium">{a.agent_name}</span>{" "}
                      <span className="text-black/60">{a.detail}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="card">
            <div className="text-black/60 text-xs uppercase tracking-wide">Agents</div>
            <div className="text-2xl font-bold mt-1">{stats.total_agents}</div>
            <div className="text-xs text-black/60 mt-1">
              {Object.entries(stats.animal_distribution).map(([a, n]) => (
                <span key={a} className="mr-1">{getEmoji(a)}{n}</span>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="text-black/60 text-xs uppercase tracking-wide">Proposals</div>
            <div className="text-2xl font-bold mt-1">{stats.total_proposals}</div>
            <div className="text-xs mt-1">
              <span className="text-green-700">{stats.proposals_passed} passed</span>
              {" \u00B7 "}
              <span className="text-red-700">{stats.proposals_rejected} rejected</span>
            </div>
          </div>
          <div className="card">
            <div className="text-black/60 text-xs uppercase tracking-wide">Debates</div>
            <div className="text-2xl font-bold mt-1">{stats.total_debates}</div>
          </div>
          <div className="card">
            <div className="text-black/60 text-xs uppercase tracking-wide">Votes Cast</div>
            <div className="text-2xl font-bold mt-1">{stats.total_votes}</div>
          </div>
          <div className="card">
            <div className="text-black/60 text-xs uppercase tracking-wide">Active Laws</div>
            <div className="text-2xl font-bold mt-1">{rules.length}</div>
            <div className="text-xs text-black/60 mt-1">
              {rules.filter(r => r.rule_type === "mechanical").length} mechanical
              {" \u00B7 "}
              {rules.filter(r => r.rule_type === "cultural").length} cultural
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Active Proposals */}
        <div className="md:col-span-2 space-y-4">
          <Link href="/proposals" className="text-lg font-semibold hover:underline">Active Proposals &rarr;</Link>
          {activeProposals.length === 0 ? (
            <div className="card text-black/60 text-center py-8">
              No active proposals yet. Waiting for agents to start governing...
            </div>
          ) : (
            activeProposals.map((p) => {
              const totalVotes = p.votes_for + p.votes_against + p.votes_abstain;
              const forPct = totalVotes > 0 ? (p.votes_for / totalVotes) * 100 : 0;
              const againstPct = totalVotes > 0 ? (p.votes_against / totalVotes) * 100 : 0;
              const abstainPct = totalVotes > 0 ? (p.votes_abstain / totalVotes) * 100 : 0;

              return (
                <Link key={p.proposal_id} href={`/proposals?expand=${p.proposal_id}`} className="card block hover:ring-1 hover:ring-black/20 transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{p.title}</h3>
                      <div className="text-sm text-black/60">
                        {getEmoji(p.proposed_by_animal)} {p.proposed_by} &middot; {timeAgo(p.created_at)}
                      </div>
                    </div>
                    <span className={`badge badge-${p.status}`}>{p.status}</span>
                  </div>
                  <p className="text-sm text-black/60 mb-3 line-clamp-2">{p.description}</p>
                  {totalVotes > 0 && (
                    <div className="mb-2">
                      <div className="vote-bar">
                        <div className="vote-bar-for" style={{ width: `${forPct}%` }} />
                        <div className="vote-bar-against" style={{ width: `${againstPct}%` }} />
                        <div className="vote-bar-abstain" style={{ width: `${abstainPct}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-black/60 mt-1">
                        <span className="text-green-700">{p.votes_for} for</span>
                        <span className="text-red-700">{p.votes_against} against</span>
                        <span>{p.votes_abstain} abstain</span>
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-black/60">
                    {p.debate_count} debate{p.debate_count !== 1 ? "s" : ""} · Click to view discussions &rarr;
                  </div>
                </Link>
              );
            })
          )}

          {/* Resolved Proposals */}
          {proposals.filter(p => p.status === "passed" || p.status === "rejected").length > 0 && (
            <>
              <h2 className="text-lg font-semibold mt-6">Resolved</h2>
              {proposals
                .filter(p => p.status === "passed" || p.status === "rejected")
                .slice(0, 5)
                .map((p) => (
                  <Link key={p.proposal_id} href={`/proposals?expand=${p.proposal_id}`} className="card opacity-75 block hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">{p.title}</h3>
                        <div className="text-xs text-black/60">
                          {getEmoji(p.proposed_by_animal)} {p.proposed_by} &middot;
                          {p.votes_for} for / {p.votes_against} against
                        </div>
                      </div>
                      <span className={`badge badge-${p.status}`}>{p.status}</span>
                    </div>
                  </Link>
                ))}
            </>
          )}

          {/* Society Laws */}
          {rules.length > 0 && (
            <>
              <h2 className="text-lg font-semibold mt-6">Society Laws</h2>
              <div className="space-y-2">
                {rules.map((rule) => (
                  <div key={rule.rule_id} className="card">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-sm">{rule.title}</h3>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        rule.rule_type === "mechanical"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}>
                        {rule.rule_type}
                      </span>
                    </div>
                    <p className="text-xs text-black/60 line-clamp-2">{rule.description}</p>
                    <div className="text-xs text-black/40 mt-1">
                      {rule.category} · enacted {timeAgo(rule.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <div className="space-y-2">
            {activity.length === 0 ? (
              <div className="card text-black/60 text-center py-8 text-sm">
                No activity yet...
              </div>
            ) : (
              activity.map((e, i) => (
                <div key={i} className="card !py-2 !px-3">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getEmoji(e.agent_animal)}</span>
                    <div className="min-w-0">
                      <div className="text-sm truncate">{e.detail}</div>
                      <div className="text-xs text-black/60">{timeAgo(e.created_at)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
