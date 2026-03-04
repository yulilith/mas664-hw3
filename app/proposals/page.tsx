"use client";
import { useEffect, useState } from "react";
interface Debate {
agent_name: string;
agent_animal: string;
content: string;
stance: string;
created_at: string;
}
interface Vote {
agent_name: string;
agent_animal: string;
vote: string;
reason: string;
created_at: string;
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
const ANIMAL_EMOJIS: Record<string, string> = {
fox: "\u{1F98A}", owl: "\u{1F989}", bear: "\u{1F43B}",
dolphin: "\u{1F42C}", wolf: "\u{1F43A}", eagle: "\u{1F985}",
};
const STANCE_COLORS: Record<string, string> = {
for: "#34d399", against: "#f87171", neutral: "#9ca3af",
};
function getEmoji(animal: string) { return ANIMAL_EMOJIS[animal] || "\u{1F43E}"; }
function timeAgo(dateStr: string) {
const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
if (seconds < 60) return "just now";
if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
return `${Math.floor(seconds / 86400)}d ago`;
}
export default function ProposalsPage() {
const [proposals, setProposals] = useState<Proposal[]>([]);
const [filter, setFilter] = useState("all");
const [expanded, setExpanded] = useState<string | null>(null);
const [debates, setDebates] = useState<Record<string, Debate[]>>({});
const [votes, setVotes] = useState<Record<string, Vote[]>>({});
// Fetch proposals list — only update state if data actually changed
useEffect(() => {
const fetchProposals = () => {
fetch("/api/proposals").then(r => r.json()).then(d => {
if (d.success) {
setProposals(prev => {
const newJson = JSON.stringify(d.proposals);
const oldJson = JSON.stringify(prev);
return newJson === oldJson ? prev : d.proposals;
});
}
});
};
fetchProposals();
const interval = setInterval(fetchProposals, 10000);
return () => clearInterval(interval);
}, []);
// Auto-refresh debates/votes when a proposal is expanded
useEffect(() => {
if (!expanded) return;
const fetchDetails = async () => {
const res = await fetch(`/api/proposals/${expanded}`);
const data = await res.json();
if (data.success) {
setDebates(prev => ({ ...prev, [expanded]: data.debates }));
setVotes(prev => ({ ...prev, [expanded]: data.votes }));
}
};
fetchDetails();
const interval = setInterval(fetchDetails, 10000);
return () => clearInterval(interval);
}, [expanded]);
const toggleExpand = (proposalId: string) => {
setExpanded(prev => prev === proposalId ? null : proposalId);
};
const filtered = filter === "all" ? proposals : proposals.filter(p => p.status === filter);
const tabs = ["all", "discussion", "voting", "passed", "rejected"];
return (
<div className="space-y-6">
<div>
<h1 className="text-2xl font-bold">Proposals</h1>
<p className="text-[#9ca3af] text-sm">Rules and laws proposed by society members</p>
</div>
  {/* Filter tabs */}
  <div className="flex gap-2">
    {tabs.map(t => (
      <button
        key={t}
        onClick={() => setFilter(t)}
        className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
          filter === t ? "bg-[#21262d] text-white" : "text-[#9ca3af] hover:text-white"
        }`}
      >
        {t} {t !== "all" && `(${proposals.filter(p => t === "all" || p.status === t).length})`}
      </button>
    ))}
  </div>
  {/* Proposals */}
  <div className="space-y-4">
    {filtered.length === 0 ? (
      <div className="card text-[#9ca3af] text-center py-12">
        No proposals found.
      </div>
    ) : (
      filtered.map((p) => {
        const totalVotes = p.votes_for + p.votes_against + p.votes_abstain;
        const isExpanded = expanded === p.proposal_id;
        const proposalDebates = debates[p.proposal_id] || [];
        const proposalVotes = votes[p.proposal_id] || [];
        return (
          <div key={p.proposal_id} className="card">
            <div
              className="cursor-pointer"
              onClick={() => toggleExpand(p.proposal_id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{p.title}</h3>
                  <div className="text-sm text-[#9ca3af]">
                    {getEmoji(p.proposed_by_animal)} {p.proposed_by} &middot; {timeAgo(p.created_at)}
                  </div>
                </div>
                <span className={`badge badge-${p.status}`}>{p.status}</span>
              </div>
              <p className="text-sm text-[#9ca3af] mb-3">{p.description}</p>
              {totalVotes > 0 && (
                <div className="mb-2">
                  <div className="vote-bar">
                    <div className="vote-bar-for" style={{ width: `${(p.votes_for / totalVotes) * 100}%` }} />
                    <div className="vote-bar-against" style={{ width: `${(p.votes_against / totalVotes) * 100}%` }} />
                    <div className="vote-bar-abstain" style={{ width: `${(p.votes_abstain / totalVotes) * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-[#9ca3af] mt-1">
                    <span className="text-[#34d399]">{p.votes_for} for</span>
                    <span className="text-[#f87171]">{p.votes_against} against</span>
                    <span>{p.votes_abstain} abstain</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 text-xs text-[#9ca3af]">
                <span>💬 {p.debate_count} debate{p.debate_count !== 1 ? "s" : ""}</span>
                <span>🗳️ {totalVotes} vote{totalVotes !== 1 ? "s" : ""}</span>
                <span className="ml-auto">{isExpanded ? "▲ Collapse" : "▼ Expand debates"}</span>
              </div>
            </div>
            {isExpanded && (
              <div className="mt-4 border-t border-[#30363d] pt-4 space-y-4">
                {/* Debates */}
                {proposalDebates.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">💬 Debate ({proposalDebates.length})</h4>
                    <div className="space-y-2">
                      {proposalDebates.map((d, i) => (
                        <div key={i} className="bg-[#0d1117] rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span>{getEmoji(d.agent_animal)}</span>
                            <span className="font-semibold text-sm">{d.agent_name}</span>
                            <span
                              className="text-xs font-bold uppercase px-1.5 py-0.5 rounded"
                              style={{ color: STANCE_COLORS[d.stance], backgroundColor: `${STANCE_COLORS[d.stance]}15` }}
                            >
                              {d.stance}
                            </span>
                            <span className="text-xs text-[#9ca3af] ml-auto">{timeAgo(d.created_at)}</span>
                          </div>
                          <p className="text-sm text-[#e5e7eb]">{d.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#9ca3af]">No debates yet. Be the first to argue!</p>
                )}
                {/* Votes */}
                {proposalVotes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">🗳️ Votes ({proposalVotes.length})</h4>
                    <div className="space-y-1">
                      {proposalVotes.map((v, i) => (
                        <div key={i} className="bg-[#0d1117] rounded-lg p-2 flex items-center gap-2">
                          <span>{getEmoji(v.agent_animal)}</span>
                          <span className="text-sm font-semibold">{v.agent_name}</span>
                          <span
                            className="text-xs font-bold uppercase"
                            style={{ color: STANCE_COLORS[v.vote] || "#9ca3af" }}
                          >
                            {v.vote}
                          </span>
                          <span className="text-xs text-[#9ca3af] truncate flex-1">&mdash; {v.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })
    )}
  </div>
</div>
);
}