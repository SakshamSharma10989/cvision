// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectDB } from '@/dbConfig/dbConfig';

export async function POST(req) {
  await connectDB();
  const { username, password } = await req.json();
  const user = await User.findOne({ username });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return NextResponse.json({ error: 'Invalid creds' }, { status: 401 });
  }
  const token = jwt.sign({ id: user._id, username }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const res = NextResponse.json({ user: { id: user._id, username } });
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
