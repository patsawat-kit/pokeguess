import { NextResponse } from 'next/server';
import { getUserFromCookie } from '@/lib/auth';
import { queryOne, query } from '@/lib/db';

export async function GET() {
    try {
        // Get user ID from cookie
        const userId = await getUserFromCookie();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch user profile
        const user = await queryOne(
            `SELECT id, username, email, trainer_id, created_at
       FROM users
       WHERE id = $1`,
            [userId]
        );

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Fetch user's game stats
        const stats = await query(
            `SELECT mode, current_streak, best_streak, last_played
       FROM gamestats
       WHERE user_id = $1
       ORDER BY mode`,
            [userId]
        );

        // Return user profile and stats
        return NextResponse.json(
            {
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    trainer_id: user.trainer_id,
                    created_at: user.created_at,
                },
                stats: stats || [],
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Me endpoint error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
