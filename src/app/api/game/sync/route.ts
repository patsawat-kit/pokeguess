import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookie } from '@/lib/auth';
import { upsertGameStats } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const userId = await getUserFromCookie();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { mode, currentStreak, bestStreak } = body;

        if (!mode || typeof currentStreak !== 'number' || typeof bestStreak !== 'number') {
            return NextResponse.json(
                { success: false, error: 'Invalid data' },
                { status: 400 }
            );
        }

        // Update stats in database
        await upsertGameStats(userId, mode, currentStreak, bestStreak);

        return NextResponse.json({
            success: true,
            mode,
            currentStreak,
            bestStreak
        });

    } catch (error) {
        console.error('Sync stats error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
