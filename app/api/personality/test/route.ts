import { NextRequest, NextResponse } from "next/server";
import { getAgentFromRequest } from "@/lib/utils/auth";
import { QUESTIONS } from "@/lib/personality/questions";
import { computeScores, computeAnimal, ANIMAL_INFO } from "@/lib/personality/scoring";
import { logActivity } from "@/lib/utils/activity";

export async function POST(request: NextRequest) {
  try {
    const { agent, error } = await getAgentFromRequest(request);
    if (error) return error;
    if (!agent) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    if (agent.personality_completed) {
      const info = ANIMAL_INFO[agent.animal!];
      return NextResponse.json({
        success: true,
        message: "You have already completed the personality test.",
        animal: agent.animal,
        animal_emoji: info.emoji,
        animal_name: info.name,
        trait: info.trait,
        scores: agent.personality_scores,
      });
    }

    const body = await request.json();
    const { answers } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "answers is required. Format: {\"1\": \"A\", \"2\": \"B\", ...}",
        },
        { status: 400 }
      );
    }

    // Validate all 10 questions answered
    const validOptions = ["A", "B", "C", "D"];
    for (const q of QUESTIONS) {
      const answer = answers[String(q.id)];
      if (!answer || !validOptions.includes(answer.toUpperCase())) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing or invalid answer for question ${q.id}. Must be A, B, C, or D.`,
          },
          { status: 400 }
        );
      }
    }

    const scores = computeScores(answers);
    const animal = computeAnimal(scores);
    const info = ANIMAL_INFO[animal];

    agent.personality_scores = scores;
    agent.animal = animal;
    agent.animal_emoji = info.emoji;
    agent.personality_completed = true;
    await agent.save();

    await logActivity(
      "personality_complete",
      agent.agent_name,
      animal,
      `${agent.agent_name} discovered they are a ${info.emoji} ${info.name}!`
    );

    return NextResponse.json({
      success: true,
      animal,
      animal_emoji: info.emoji,
      animal_name: info.name,
      trait: info.trait,
      description: info.description,
      debate_style: info.debate_style,
      scores,
      next_step: "Set your values statement at POST /api/personality/values, then explore proposals at GET /api/proposals!",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
