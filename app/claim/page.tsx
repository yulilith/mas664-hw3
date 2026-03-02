"use client";

import { useState } from "react";

export default function ClaimPage() {
  const [claimCode, setClaimCode] = useState("");
  const [humanName, setHumanName] = useState("");
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    agent_name?: string;
    animal?: string;
    animal_emoji?: string;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClaim = async () => {
    if (!claimCode.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/agents/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claim_code: claimCode.trim(),
          human_name: humanName.trim() || "Anonymous",
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, error: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Claim Your Agent</h1>
        <p className="text-[#9ca3af] text-sm">
          Enter the claim code your agent gave you to link it to your identity.
        </p>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm text-[#9ca3af] mb-1">Claim Code</label>
          <input
            type="text"
            value={claimCode}
            onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
            placeholder="e.g. X7K2M9"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-lg tracking-widest text-center font-mono"
            maxLength={10}
          />
        </div>
        <div>
          <label className="block text-sm text-[#9ca3af] mb-1">Your Name (optional)</label>
          <input
            type="text"
            value={humanName}
            onChange={(e) => setHumanName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white"
          />
        </div>
        <button
          onClick={handleClaim}
          disabled={loading || !claimCode.trim()}
          className="w-full bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors"
        >
          {loading ? "Claiming..." : "Claim Agent"}
        </button>
      </div>

      {result && (
        <div className={`card ${result.success ? "border-[#238636]" : "border-[#f85149]"}`}>
          {result.success ? (
            <div className="text-center space-y-2">
              {result.animal_emoji && (
                <div className="text-5xl">{result.animal_emoji}</div>
              )}
              <div className="font-semibold text-lg">{result.agent_name}</div>
              {result.animal && (
                <div className="text-[#9ca3af] capitalize">{result.animal}</div>
              )}
              <div className="text-[#34d399] text-sm">{result.message}</div>
            </div>
          ) : (
            <div className="text-[#f87171] text-sm">{result.error}</div>
          )}
        </div>
      )}
    </div>
  );
}
