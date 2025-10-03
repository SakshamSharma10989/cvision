import { NextResponse } from "next/server"
import { writeFile, unlink } from "fs/promises"
import path from "path"
import { tmpdir } from "os"
import parsePDF from "pdf-parse/lib/pdf-parse.js"
import cloudinary from "cloudinary"
import { connectDB } from "@/dbConfig/dbConfig"
import Resume from "@/models/Resume"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import mongoose from "mongoose"   // ✅ FIX: added this import

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
    // ✅ Session from NextAuth
    const session = await getServerSession(authOptions)
    console.log("📌 Upload session check:", session)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ✅ Extract file
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

    // ✅ Upload to Cloudinary
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

    // ✅ Extract text
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

    // ✅ Save in MongoDB with ObjectId
    await connectDB()
    const savedResume = await Resume.create({
      userId: new mongoose.Types.ObjectId(session.user.id), // ✅ FIX
      filename: fileName,
      fileUrl: cloudResult.secure_url,
      text,
      uploadedAt: new Date(),
    })

    return NextResponse.json(savedResume, { status: 200 })
  } catch (err) {
    console.error("❌ Resume processing error:", err)
    return NextResponse.json(
      { error: "Failed to process resume.", details: err.message },
      { status: 500 }
    )
  }
}
