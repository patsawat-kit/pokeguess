import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const MAX_POKEMON_ID = 1010; // Total number of Pokemon in API

interface FlavorTextEntry {
    flavor_text: string;
    language: {
        name: string;
        url: string;
    };
    version: {
        name: string;
        url: string;
    };
}

interface PokemonSpeciesData {
    id: number;
    name: string;
    flavor_text_entries: FlavorTextEntry[];
}

async function fetchRandomPokemonSpecies(): Promise<PokemonSpeciesData> {
    const randomId = Math.floor(Math.random() * MAX_POKEMON_ID) + 1;

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${randomId}`);

    if (!response.ok) {
        throw new Error('Failed to fetch Pokemon Species');
    }

    const data = await response.json();

    return {
        id: data.id,
        name: data.name,
        flavor_text_entries: data.flavor_text_entries,
    };
}

function sanitizeFlavorText(text: string, pokemonName: string): string {
    // Replace the Pokemon's name (case-insensitive) with underscores
    // Also handle some common variations or parts of the name if necessary, 
    // but for now, exact name replacement is a good start.
    // We can also replace newlines with spaces for better display.

    let sanitized = text.replace(/\n|\f/g, ' '); // Replace newlines/form feeds with space

    const nameRegex = new RegExp(pokemonName, 'gi');
    sanitized = sanitized.replace(nameRegex, '_______');

    return sanitized;
}

export async function POST(request: NextRequest) {
    try {
        // Fetch random Pokemon Species from PokeAPI
        const species = await fetchRandomPokemonSpecies();

        // Filter for English flavor text
        const englishEntries = species.flavor_text_entries.filter(
            (entry) => entry.language.name === 'en'
        );

        if (englishEntries.length === 0) {
            // Fallback if no English text found (rare but possible)
            // Recursively try again or throw error. 
            // For simplicity, let's just try fetching another one.
            return POST(request);
        }

        // Select a random English entry
        const randomEntry = englishEntries[Math.floor(Math.random() * englishEntries.length)];

        // Sanitize the text
        const sanitizedText = sanitizeFlavorText(randomEntry.flavor_text, species.name);

        // Generate a signed JWT containing the answer
        const gameToken = await new SignJWT({
            pokemonId: species.id,
            pokemonName: species.name.toLowerCase(),
            mode: 'trivia',
            timestamp: Date.now(),
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('10m') // Token expires in 10 minutes
            .sign(JWT_SECRET);

        // Return ONLY the sanitized text and token (NOT the name)
        return NextResponse.json({
            success: true,
            flavorText: sanitizedText,
            gameToken: gameToken,
            // We don't send pokemonId or name to client to prevent cheating via network inspection
        });
    } catch (error) {
        console.error('Trivia start error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to start trivia game' },
            { status: 500 }
        );
    }
}
