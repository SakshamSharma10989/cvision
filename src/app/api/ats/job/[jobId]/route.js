import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConfig";
import Analysis from "@/models/Analysis";

export async function GET(req, context) {
  // 🔥 THIS IS THE FIX
  const { jobId } = await context.params;

  await connectDB();

  const analysis = await Analysis.findOne({ cacheKey: jobId }).lean();

  if (!analysis) {
    return NextResponse.json(
      { status: "pending" },
      { status: 202 }
    );
  }

  return NextResponse.json(analysis.result);
}
