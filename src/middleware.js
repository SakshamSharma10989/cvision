import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === '/login' || path === '/signup' || path === '/';
  const token = request.cookies.get('token')?.value || '';
  
  // Log only once per request (avoid spamming)
  console.log('Middleware triggered - Path:', path, 'Token:', token);

  if (isPublicPath && token && path !== '/') {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }
}

export const config = {
  matcher: ['/', '/api', '/ats', '/jobs', '/keyword-analysis', '/login', '/resumes', '/signup'],
};