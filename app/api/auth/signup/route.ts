import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { salutation, name, email, password } = body;

    if (!salutation || !['Mr.', 'Ms.', 'Mrs.'].includes(salutation)) {
      return NextResponse.json(
        { success: false, error: 'Please select a valid salutation (Mr., Ms., Mrs.).' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Full name must be at least 2 characters long.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 8 || password.length > 12) {
      return NextResponse.json(
        { success: false, error: 'Password must be strictly 8 to 12 characters long.' },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail }).select('_id').lean();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists.' },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(7);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      salutation,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return NextResponse.json(
      { success: true, message: 'Account registered successfully.' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Sign up error:', error?.message ? error.message : error);

    return NextResponse.json(
      { success: false, error: 'An error occurred during account registration.' },
      { status: 500 }
    );
  }
}
