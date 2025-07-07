// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const publicPaths = ['/', '/login', '/signup'];
  const isPublic = publicPaths.includes(pathname);

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/jobs/:path*', '/ats/:path*', '/login', '/signup'],
};
