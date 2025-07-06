import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import User from '@/models/User';
import { connectDB } from '@/dbConfig/dbConfig';

export async function POST(req) {
  try {
    await connectDB(); // ✅ move it inside the handler

    const { name, username, password, email } = await req.json();
    if (!name || !username || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password length must be at least 6 characters' }, { status: 400 });
    }

    const bcryptSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, bcryptSalt);
    const userDoc = await User.create({ name, username, email, password: hashedPassword });
    return NextResponse.json(userDoc, { status: 201 });
  } catch (err) {
    console.error('Registration Error:', err);
    return NextResponse.json({ error: 'Registration failed', details: err.message }, { status: 500 });
  }
}
