import { NextRequest, NextResponse } from "next/server";
import { runTick } from "@/lib/simulation/engine";
import { TickResult } from "@/lib/simulation/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tickCount = Math.min(Math.max(Number(body.tick_count) || 1, 1), 5);

    const results: TickResult[] = [];
    for (let i = 0; i < tickCount; i++) {
      const result = await runTick();
      results.push(result);
    }

    return NextResponse.json({
      success: true,
      ticks: results,
      total_actions: results.reduce((sum, r) => sum + r.actions.length, 0),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
