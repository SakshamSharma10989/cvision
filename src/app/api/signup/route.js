import { NextResponse } from "next/server"
import { connectDB } from "@/dbConfig/dbConfig"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, username, email, password } = body

    await connectDB()

    // Check for existing email
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Optional: check for existing username
    if (username) {
      const existingUsername = await User.findOne({ username })
      if (existingUsername) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 })
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const newUser = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      provider: "credentials",   // ✅ explicitly set provider
    })

    return NextResponse.json({
      message: "Signup successful",
      user: { id: newUser._id, email: newUser.email }
    })
  } catch (err) {
    console.error("❌ Signup error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
