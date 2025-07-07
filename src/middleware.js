// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('token')?.value;

  const isPublicPath = path === '/login' || path === '/signup' || path === '/';

  if (isPublicPath && token && path !== '/') {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/ats',
    '/jobs',
    '/keyword-analysis',
    '/login',
    '/signup',
    '/resumes',
    '/api',
  ],
};
