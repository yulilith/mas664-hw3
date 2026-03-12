import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import SocietyRule from "@/lib/models/SocietyRule";

export async function GET() {
  try {
    await dbConnect();
    const rules = await SocietyRule.find({ status: "active" })
      .sort({ created_at: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      rules,
      total: rules.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
