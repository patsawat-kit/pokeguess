import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getUserFromCookie } from '@/lib/auth';
import { query, queryOne, upsertGameStats } from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

interface GuessBody {
    guess: string;
    gameToken: string;
    currentStreak?: number; // For guest users
}

interface GameTokenPayload {
    pokemonId: number;
    pokemonName: string;
    mode: string;
    timestamp: number;
}

export async function POST(request: NextRequest) {
    try {
        const body: GuessBody = await request.json();
        const { guess, gameToken, currentStreak = 0 } = body;

        if (!guess || !gameToken) {
            return NextResponse.json(
                { success: false, error: 'Guess and game token are required' },
                { status: 400 }
            );
        }

        // Verify and decode the game token
        let payload: GameTokenPayload;
        try {
            const verified = await jwtVerify(gameToken, JWT_SECRET);
            payload = verified.payload as unknown as GameTokenPayload;
        } catch (error) {
            return NextResponse.json(
                { success: false, error: 'Invalid or expired game token' },
                { status: 401 }
            );
        }

        // Compare the guess with the correct answer
        const correctAnswer = payload.pokemonName.toLowerCase();
        const userGuess = guess.toLowerCase().trim();
        const isCorrect = userGuess === correctAnswer;

        // Check if user is logged in
        const userId = await getUserFromCookie();

        if (userId) {
            // User is authenticated - update database
            try {
                // Get current stats from database
                const currentStats = await queryOne<{
                    current_streak: number;
                    best_streak: number;
                }>`
                    SELECT current_streak, best_streak 
                    FROM gamestats 
                    WHERE user_id = ${userId} AND mode = ${payload.mode}`;

                const currentDbStreak = currentStats?.current_streak || 0;
                const currentBestStreak = currentStats?.best_streak || 0;

                // Calculate new streak
                const newStreak = isCorrect ? currentDbStreak + 1 : 0;
                const newBestStreak = Math.max(newStreak, currentBestStreak);

                // Update stats in database
                await upsertGameStats(userId, payload.mode, newStreak, newBestStreak);

                return NextResponse.json({
                    success: true,
                    correct: isCorrect,
                    correctAnswer: isCorrect ? correctAnswer : undefined,
                    newStreak: newStreak,
                    bestStreak: newBestStreak,
                    authenticated: true,
                });
            } catch (error) {
                console.error('Database update error:', error);
                // Still return the result even if DB update fails
                return NextResponse.json({
                    success: true,
                    correct: isCorrect,
                    correctAnswer: isCorrect ? correctAnswer : undefined,
                    error: 'Failed to update stats',
                });
            }
        } else {
            // Guest user - just return the result
            const newStreak = isCorrect ? currentStreak + 1 : 0;

            return NextResponse.json({
                success: true,
                correct: isCorrect,
                correctAnswer: isCorrect ? correctAnswer : undefined,
                newStreak: newStreak,
                authenticated: false,
            });
        }
    } catch (error) {
        console.error('Game guess error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
