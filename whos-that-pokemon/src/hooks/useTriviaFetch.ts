import { useState, useCallback } from 'react';
import { CONFIG } from '../constants/gameConfig';

interface TriviaQuestion {
    flavorText: string;
    pokemonName: string;
    id: number;
    image: string; // Adding image for the reveal
    types: string[];
}

export function useTriviaFetch() {
    const [question, setQuestion] = useState<TriviaQuestion | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTrivia = useCallback(async () => {
        setLoading(true);
        setError(null);
        setQuestion(null);

        try {
            // Random ID between 1 and 1025 (approx max gen 9)
            // Or use the same generation logic if we want to respect settings, 
            // but for now let's just pick a random one for simplicity or reuse logic if possible.
            // The prompt didn't specify generation filtering for Trivia, but it's good practice.
            // For now, simple random 1-151 (Gen 1) to start or 1-1000. 
            // Let's stick to Gen 1-9 range roughly.
            const randomId = Math.floor(Math.random() * 1000) + 1;

            const res = await fetch(`${CONFIG.API_URL}/pokemon-species/${randomId}`);
            if (!res.ok) throw new Error('Failed to fetch species data');
            const data = await res.json();

            // Get English flavor text
            const englishEntries = data.flavor_text_entries.filter(
                (entry: any) => entry.language.name === 'en'
            );

            if (englishEntries.length === 0) {
                throw new Error('No English flavor text found');
            }

            // Pick random entry
            const randomEntry = englishEntries[Math.floor(Math.random() * englishEntries.length)];

            // Clean up text (remove newlines, form feeds)
            const cleanText = randomEntry.flavor_text
                .replace(/\f/g, ' ')
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            // Fetch pokemon basic data for the image and types
            const pokemonRes = await fetch(`${CONFIG.API_URL}/pokemon/${randomId}`);
            if (!pokemonRes.ok) throw new Error('Failed to fetch pokemon data');
            const pokemonData = await pokemonRes.json();

            setQuestion({
                flavorText: cleanText,
                pokemonName: data.name,
                id: data.id,
                image: pokemonData.sprites.front_default || pokemonData.sprites.other['official-artwork'].front_default,
                types: pokemonData.types.map((t: any) => t.type.name),
            });

        } catch (err) {
            console.error("Trivia fetch error:", err);
            setError("Failed to load trivia question. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    return { question, loading, error, fetchTrivia };
}
