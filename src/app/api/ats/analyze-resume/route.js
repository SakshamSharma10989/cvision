import { NextResponse } from "next/server";
import { analyzeATS } from "@/lib/analyzewithGemini";
import { connectDB } from "@/dbConfig/dbConfig";
import Analysis from "@/models/Analysis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const { resume, jobDescription, resumeId } = body;

    if (!resume || !jobDescription) {
      return NextResponse.json(
        { error: "Resume and job description are required" },
        { status: 400 }
      );
    }

    const resumeText = typeof resume === "string" ? resume.trim() : "";
    if (!resumeText) {
      return NextResponse.json(
        { error: "Resume text is empty or invalid" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const jobId = Math.random().toString(36).substring(2, 15);

    // 🔥 Run ATS
    const analysis = await analyzeATS(resumeText, jobDescription);

    console.log("RAW ANALYSIS OUTPUT:", JSON.stringify(analysis, null, 2));

    const finalResult = {
      scores: {
        skillsMatch: analysis?.scores?.skillsMatch || 0,
        experienceMatch: analysis?.scores?.experienceMatch || 0,
        educationMatch: analysis?.scores?.educationMatch || 0,
        overall: analysis?.scores?.overall || 0,
      },
      strengths: analysis?.strengths || {},
      weaknesses: analysis?.weaknesses || {},
    };

    await connectDB();

    await Analysis.create({
      cacheKey: jobId,
      userId,
      resumeId: resumeId || null,
      result: finalResult,
    });

    return NextResponse.json({
      jobId,
      status: "completed",
      analysis: finalResult,
    });
  } catch (err) {
    console.error("ATS ANALYSIS FAILED:", err);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}
