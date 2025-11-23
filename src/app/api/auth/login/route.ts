import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { queryOne } from '@/lib/db';
import { setAuthCookie } from '@/lib/auth';

interface LoginBody {
    identifier: string;
    password: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: LoginBody = await request.json();
        const { identifier, password } = body;

        // Validation
        if (!identifier || !password) {
            return NextResponse.json(
                { success: false, error: 'Identifier and password are required' },
                { status: 400 }
            );
        }

        // Determine if identifier is email or username
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmail = emailRegex.test(identifier);

        // Fetch user by email or username
        // Fetch user by email or username
        const user = isEmail
            ? await queryOne`
                SELECT id, username, email, password_hash, trainer_id, created_at
                FROM users
                WHERE email = ${identifier}`
            : await queryOne`
                SELECT id, username, email, password_hash, trainer_id, created_at
                FROM users
                WHERE username = ${identifier}`;

        // If user not found or password doesn't match
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Set authentication cookie
        await setAuthCookie(user.id);

        // Return user data (without password hash)
        return NextResponse.json(
            {
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    trainer_id: user.trainer_id,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
