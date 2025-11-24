import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { GEN_RANGES } from '@/src/constants/gameConfig';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

interface PokemonData {
    id: number;
    name: string;
    imageUrl: string;
    cry: string;
}

async function fetchRandomPokemon(selectedGens: number[]): Promise<PokemonData> {
    // Default to Gen 1 if no gens selected
    const validGens = selectedGens.length > 0 ? selectedGens : [1];
    const randomGenKey = validGens[Math.floor(Math.random() * validGens.length)];
    const [min, max] = GEN_RANGES[randomGenKey];

    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);

    if (!response.ok) {
        throw new Error('Failed to fetch Pokemon');
    }

    const data = await response.json();

    return {
        id: data.id,
        name: data.name,
        imageUrl: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
        cry: data.cries.latest || data.cries.legacy
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const mode = body.mode || 'classic';
        const selectedGens = body.selectedGens || [1];

        // Fetch random Pokemon from PokeAPI
        const pokemon = await fetchRandomPokemon(selectedGens);

        // Generate a signed JWT containing the answer
        const gameToken = await new SignJWT({
            pokemonId: pokemon.id,
            pokemonName: pokemon.name.toLowerCase(),
            pokemonCry: pokemon.cry,
            mode: mode,
            timestamp: Date.now(),
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('30m') // Token expires in 30 minutes
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
