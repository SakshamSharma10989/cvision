import { NextResponse } from "next/server";
import { analyzeATS } from "@/lib/analyzewithGemini";
import jobStore from "@/lib/jobStore";
import { connectDB } from "@/dbConfig/dbConfig";
import Analysis from "@/models/Analysis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  const body = await req.json();
  const { resume, jobDescription, resumeId } = body;

  if (!resume || !jobDescription) {
    return NextResponse.json({ error: "Resume and job description are required" }, { status: 400 });
  }

  const resumeText = typeof resume === "string" ? resume.trim() : "";
  if (!resumeText) {
    return NextResponse.json({ error: "Resume text is empty or invalid" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const jobId = Math.random().toString(36).substring(2, 15);
  jobStore.set(jobId, { status: "pending", analysis: null, error: null });

  setTimeout(async () => {
    try {
      const analysis = await analyzeATS(resumeText, jobDescription);
      console.log("🔍 AI Analysis Result:", analysis);

      jobStore.set(jobId, { status: "completed", analysis, error: null });

      await connectDB();

      const overall = Number(
        (analysis?.scores?.overall ??
          analysis?.scores?.matchScore ??
          analysis?.overall) || 0
      );

      const missingSkills = Array.isArray(analysis?.weaknesses?.skills)
        ? analysis.weaknesses.skills.slice(0, 5)
        : [];

      await Analysis.create({
        cacheKey: jobId,
        userId,
        resumeId: resumeId || null,
        result: {
          scores: { overall },
          missingSkills,
        },
      });
    } catch (err) {
      jobStore.set(jobId, {
        status: "failed",
        analysis: null,
        error: err?.message || "Analysis failed",
      });
    }
  }, 0);

  return NextResponse.json({ jobId, status: "pending" });
}
