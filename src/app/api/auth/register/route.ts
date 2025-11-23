import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { queryOne } from '@/lib/db';
import { setAuthCookie } from '@/lib/auth';

interface RegisterBody {
    username: string;
    email: string;
    password: string;
    guestStats?: Record<string, { currentStreak: number; bestStreak: number }>;
}

export async function POST(request: NextRequest) {
    try {
        const body: RegisterBody = await request.json();
        const { username, email, password } = body;

        // Validation
        if (!username || !email || !password) {
            return NextResponse.json(
                { success: false, error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Validate password length
        if (password.length < 8) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Generate random 6-digit trainer_id
        const generateTrainerId = () => Math.floor(100000 + Math.random() * 900000);

        // Try to insert user with retry logic for trainer_id collision
        let user = null;
        let attempts = 0;
        const maxAttempts = 10;

        while (!user && attempts < maxAttempts) {
            const trainer_id = generateTrainerId();

            try {
                user = await queryOne(
                    `INSERT INTO users (username, email, password_hash, trainer_id)
           VALUES ($1, $2, $3, $4)
           RETURNING id, username, email, trainer_id, created_at`,
                    [username, email, password_hash, trainer_id]
                );
            } catch (error: any) {
                attempts++;

                // Check if error is due to unique constraint violation
                if (error.code === '23505') { // PostgreSQL unique violation code
                    if (error.constraint?.includes('username')) {
                        return NextResponse.json(
                            { success: false, error: 'Username already exists' },
                            { status: 409 }
                        );
                    } else if (error.constraint?.includes('email')) {
                        return NextResponse.json(
                            { success: false, error: 'Email already exists' },
                            { status: 409 }
                        );
                    }
                    // If it's trainer_id collision, retry with new ID
                    if (error.constraint?.includes('trainer_id') && attempts < maxAttempts) {
                        continue;
                    }
                }

                // For any other error, throw it
                throw error;
            }
        }

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Failed to generate unique trainer ID' },
                { status: 500 }
            );
        }

        // Set authentication cookie
        await setAuthCookie(user.id);

        // Handle Guest Stats Migration
        if (body.guestStats) {
            try {
                const { guestStats } = body;
                const modes = Object.keys(guestStats);

                for (const mode of modes) {
                    const stats = guestStats[mode];
                    if (stats.currentStreak > 0 || stats.bestStreak > 0) {
                        await queryOne(
                            `INSERT INTO gamestats (user_id, mode, current_streak, best_streak)
                             VALUES ($1, $2, $3, $4)
                             ON CONFLICT (user_id, mode) DO UPDATE
                             SET current_streak = GREATEST(gamestats.current_streak, EXCLUDED.current_streak),
                                 best_streak = GREATEST(gamestats.best_streak, EXCLUDED.best_streak),
                                 updated_at = NOW()`,
                            [user.id, mode, stats.currentStreak, stats.bestStreak]
                        );
                    }
                }
            } catch (statsError) {
                console.error('Failed to migrate guest stats:', statsError);
                // Don't fail registration if stats migration fails, just log it
            }
        }

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
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
