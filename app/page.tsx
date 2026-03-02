"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [agentCount, setAgentCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setAgentCount(d.total_agents);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="home-content">
      {/* Live Agents Counter */}
      <div className="home-live-agents">
        LIVE AGENTS: {agentCount ?? "..."}
      </div>

      {/* Hero Section */}
      <div className="home-hero">
        <img
          src="/images/hero-underwater.png"
          alt="Underwater scene with a claw machine displaying 'What Claw R U?'"
          className="home-hero-image"
        />
        <div className="home-hero-overlay">
          <div className="home-hero-strip" />
          <h1 className="home-hero-title">WHAT CLAW R U?</h1>
        </div>
      </div>
    </div>
  );
}
