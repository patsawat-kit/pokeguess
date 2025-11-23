import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const MAX_POKEMON_ID = 1010; // Total number of Pokemon in API

interface PokemonData {
    id: number;
    name: string;
    imageUrl: string;
}

async function fetchRandomPokemon(): Promise<PokemonData> {
    const randomId = Math.floor(Math.random() * MAX_POKEMON_ID) + 1;

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);

    if (!response.ok) {
        throw new Error('Failed to fetch Pokemon');
    }

    const data = await response.json();

    return {
        id: data.id,
        name: data.name,
        imageUrl: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const mode = body.mode || 'classic'; // Support different game modes

        // Fetch random Pokemon from PokeAPI
        const pokemon = await fetchRandomPokemon();

        // Generate a signed JWT containing the answer
        const gameToken = await new SignJWT({
            pokemonId: pokemon.id,
            pokemonName: pokemon.name.toLowerCase(),
            mode: mode,
            timestamp: Date.now(),
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('10m') // Token expires in 10 minutes
            .sign(JWT_SECRET);

        // Return ONLY the image URL and token (NOT the name)
        return NextResponse.json({
            success: true,
            imageUrl: pokemon.imageUrl,
            gameToken: gameToken,
            pokemonId: pokemon.id, // Safe to send for tracking, but not the name
        });
    } catch (error) {
        console.error('Game start error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to start game' },
            { status: 500 }
        );
    }
}
