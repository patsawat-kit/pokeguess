import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

interface GameTokenPayload {
    pokemonId: number;
    pokemonName: string;
    pokemonCry: string;
    mode: string;
    timestamp: number;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { gameToken } = body;

        if (!gameToken) {
            return NextResponse.json(
                { success: false, error: 'Game token is required' },
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

        return NextResponse.json({
            success: true,
            name: payload.pokemonName,
            cry: payload.pokemonCry
        });
    } catch (error) {
        console.error('Game reveal error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
