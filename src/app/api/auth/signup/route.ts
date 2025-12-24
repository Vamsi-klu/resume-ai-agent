import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import {
    validatePassword,
    validateEmail,
    hashPassword,
    createSession,
} from '@/lib/services/auth.service';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, email, password } = body;

        // Validate required fields
        if (!username || !email || !password) {
            return NextResponse.json(
                { error: 'Username, email, and password are required' },
                { status: 400 }
            );
        }

        // Validate username length
        if (username.length < 3 || username.length > 50) {
            return NextResponse.json(
                { error: 'Username must be between 3 and 50 characters' },
                { status: 400 }
            );
        }

        // Validate email format
        if (!validateEmail(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return NextResponse.json(
                { error: 'Password does not meet requirements', details: passwordValidation.errors },
                { status: 400 }
            );
        }

        // Check if username or email already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: username.toLowerCase() },
                    { email: email.toLowerCase() },
                ],
            },
        });

        if (existingUser) {
            if (existingUser.username.toLowerCase() === username.toLowerCase()) {
                return NextResponse.json(
                    { error: 'Username already taken' },
                    { status: 409 }
                );
            }
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 409 }
            );
        }

        // Hash password and create user
        const passwordHash = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                username: username.toLowerCase(),
                email: email.toLowerCase(),
                passwordHash,
            },
        });

        // Create session
        const { token } = await createSession(user.id);

        return NextResponse.json(
            {
                message: 'Account created successfully',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
                token,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
