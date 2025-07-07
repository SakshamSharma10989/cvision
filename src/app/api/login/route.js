import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectDB } from '@/dbConfig/dbConfig';

const jwtSecret = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    await connectDB(); // Attempt to connect

    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const userDoc = await User.findOne({ username });
    if (!userDoc) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, userDoc.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: userDoc._id, username: userDoc.username, name: userDoc.name },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Create response and set cookie
    const response = NextResponse.json(
      { token, user: { id: userDoc._id, username: userDoc.username, name: userDoc.name } },
      { status: 200 }
    );
    response.cookies.set('token', token, {
      httpOnly: true, // Prevents client-side JavaScript access
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      path: '/', // Accessible across the app
      sameSite: 'strict', 
      secure:'true',
      maxAge: 7 * 24 * 60 * 60, 
    });

    return response;
  } catch (err) {
    console.error('Login Error at', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), ':', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}