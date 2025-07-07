// src/app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/dbConfig/dbConfig';
import User from '@/models/User';

const jwtSecret = process.env.JWT_SECRET;

export async function GET(req) {
  try {
    await connectDB(); // make sure DB is connected

    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id).select('username name');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      username: user.username,
      name: user.name,
    });
  } catch (err) {
    console.error('🔐 Auth Check Error:', err);
    return NextResponse.json({ error: 'Unauthorized', details: err.message }, { status: 401 });
  }
}
