import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { connectDB } from "@/dbConfig/dbConfig"
import User from "@/models/User"
import { compare } from "bcryptjs"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB()
        const user = await User.findOne({ email: credentials?.email })
        if (!user) return null
        const isValid = await compare(credentials.password, user.password)
        if (!isValid) return null
        return { id: user._id.toString(), email: user.email }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      await connectDB()
      let dbUser = await User.findOne({ email: user.email })
      if (!dbUser && account?.provider === "google") {
        dbUser = await User.create({
          name: user.name || "",
          email: user.email,
          username: user.email.split("@")[0],
          password: null,
        })
      }
      if (dbUser) {
        user.id = dbUser._id.toString()
      }
      return true
    },
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id
      return session
    },
  },
  pages: { signIn: "/login" },
}
