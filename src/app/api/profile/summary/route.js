import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDB } from "@/dbConfig/dbConfig"
import User from "@/models/User"
import Resume from "@/models/Resume"
import Analysis from "@/models/Analysis"

export async function GET() {
  try {
    // ✅ Validate session
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // ✅ Try finding user by id, fallback to email
    let user = null
    try {
      if (session.user.id) {
        user = await User.findById(session.user.id)
      }
    } catch {
      // ignore invalid ObjectId errors
    }

    if (!user && session.user.email) {
      user = await User.findOne({ email: session.user.email })
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // ✅ Fetch last 3 resumes
    const resumes = await Resume.find({ userId: user._id })
      .sort({ uploadedAt: -1 })
      .limit(3)
      .lean()

    // ✅ Attach analyses for each resume
    const resumesWithAnalyses = await Promise.all(
      resumes.map(async (resume) => {
        const analyses = await Analysis.find({ resumeId: resume._id })
          .sort({ createdAt: -1 })
          .limit(3)
          .lean()

        return {
          _id: resume._id,
          filename: resume.filename,
          fileUrl: resume.fileUrl,
          uploadedAt: resume.uploadedAt,
          analyses: analyses.map((a) => ({
            _id: a._id,
            createdAt: a.createdAt,
            overall: a?.result?.scores?.overall ?? null,
            missingSkills: a?.result?.missingSkills ?? [],
          })),
        }
      })
    )

    return NextResponse.json({
      user: {
        username: user.username || "",
        email: user.email || "",
        name: user.name || "",
      },
      resumes: resumesWithAnalyses,
    })
  } catch (err) {
    console.error("❌ profile/summary error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
