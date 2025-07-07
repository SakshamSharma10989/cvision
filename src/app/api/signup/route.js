import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectDB } from '@/dbConfig/dbConfig';

const jwtSecret = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    await connectDB();

    const { name, username, password, email } = await req.json();

    if (!name || !username || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return NextResponse.json({ error: 'Username or email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, username, email, password: hashedPassword });

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, name: newUser.name },
      jwtSecret,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      user: {
        id: newUser._id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email
      }
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    });

    return response;
  } catch (err) {
    console.error('Registration Error:', err);
    return NextResponse.json({ error: 'Registration failed', details: err.message }, { status: 500 });
  }
}
