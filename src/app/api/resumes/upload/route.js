import { NextResponse } from "next/server"
import { writeFile, unlink } from "fs/promises"
import path from "path"
import { tmpdir } from "os"
import parsePDF from "pdf-parse/lib/pdf-parse.js"
import cloudinary from "cloudinary"
import { connectDB } from "@/dbConfig/dbConfig"
import Resume from "@/models/Resume"
import { getServerSession } from "next-auth"
import { getToken } from "next-auth/jwt"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

export const runtime = "nodejs" // ensure Node runtime

cloudinary.v2.config({
  cloud_name: "dybqyd3vp",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const timeout = (ms) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Cloudinary upload timed out")), ms)
  )

export async function POST(req) {
  try {
    // Log cookies for debugging
    console.log("📌 Cookies received:", req.headers.get("cookie"))

    // Attempt to get session
    let session = await getServerSession(authOptions)

    // Fallback: get JWT token directly if session is null
    if (!session) {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
      console.log("📌 JWT token received:", token)
      if (token?.id) {
        session = { user: { id: token.id } }
      }
    }

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: session missing" },
        { status: 401 }
      )
    }

    // Extract file from formData
    const formData = await req.formData()
    const file = formData.get("file")
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = file.name
    const fileType = file.type

    const tempPath = path.join(tmpdir(), `${Date.now()}-${fileName}`)
    await writeFile(tempPath, buffer)

    // Upload to Cloudinary
    const cloudResult = await Promise.race([
      new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          { folder: "resumes", resource_type: "raw" },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        uploadStream.end(buffer)
      }),
      timeout(10000),
    ])

    // Extract text from PDF
    let text = ""
    if (fileType === "application/pdf") {
      const pdfData = await parsePDF(buffer)
      text = pdfData.text || ""
    } else {
      throw new Error("Unsupported file format")
    }

    await unlink(tempPath)
    if (!text.trim()) {
      throw new Error("No text could be extracted from the resume")
    }

    // Save resume in MongoDB
    await connectDB()
    const savedResume = await Resume.create({
      userId: new mongoose.Types.ObjectId(session.user.id),
      filename: fileName,
      fileUrl: cloudResult.secure_url,
      text,
      uploadedAt: new Date(),
    })

    return NextResponse.json(savedResume, { status: 200 })
  } catch (err) {
    console.error("❌ Resume processing error:", err)
    const statusCode = err.message.includes("Unauthorized") ? 401 : 500
    return NextResponse.json(
      { error: err.message || "Failed to process resume" },
      { status: statusCode }
    )
  }
}
