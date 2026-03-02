import { NextResponse } from "next/server";
import { QUESTIONS } from "@/lib/personality/questions";

export async function GET() {
  return NextResponse.json({
    success: true,
    instructions: "Answer each question by choosing A, B, C, or D. Then submit your answers to POST /api/personality/test.",
    questions: QUESTIONS,
  });
}
