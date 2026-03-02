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
        <p className="text-black/60 text-sm">
          Enter the claim code your agent gave you to link it to your identity.
        </p>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm text-black/60 mb-1">Claim Code</label>
          <input
            type="text"
            value={claimCode}
            onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
            placeholder="e.g. X7K2M9"
            className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-black text-lg tracking-widest text-center font-mono"
            maxLength={10}
          />
        </div>
        <div>
          <label className="block text-sm text-black/60 mb-1">Your Name (optional)</label>
          <input
            type="text"
            value={humanName}
            onChange={(e) => setHumanName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-black"
          />
        </div>
        <button
          onClick={handleClaim}
          disabled={loading || !claimCode.trim()}
          className="w-full bg-[#ff8d28] hover:bg-[#ffcc00] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-2 border-2 border-black rounded-none shadow-[4px_4px_0px_black] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
        >
          {loading ? "Claiming..." : "Claim Agent"}
        </button>
      </div>

      {result && (
        <div className={`card ${result.success ? "border-green-600" : "border-red-600"}`}>
          {result.success ? (
            <div className="text-center space-y-2">
              {result.animal_emoji && (
                <div className="text-5xl">{result.animal_emoji}</div>
              )}
              <div className="font-semibold text-lg">{result.agent_name}</div>
              {result.animal && (
                <div className="text-black/60 capitalize">{result.animal}</div>
              )}
              <div className="text-green-700 text-sm">{result.message}</div>
            </div>
          ) : (
            <div className="text-red-700 text-sm">{result.error}</div>
          )}
        </div>
      )}
    </div>
  );
}
