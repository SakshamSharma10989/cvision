import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  const publicPaths = ["/login", "/signup"]
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  if (!token) {
    console.log("🔴 No token, redirecting")
    return NextResponse.redirect(new URL("/login", req.url))
  }

  console.log("✅ Token found, allowing access")
  return NextResponse.next()
}

export const config = {
  matcher: ["/profile/:path*", "/jobs/:path*", "/ats/:path*"],
}
