import { useState, useCallback } from 'react';
import { CONFIG, GEN_RANGES } from '../constants/gameConfig';

interface Pokemon {
    name: string;
    image: string;
    id: number;
    cry: string;
}

export function usePokemonFetch(selectedGens: number[], playSound: (type: "beep" | "success" | "error") => void) {
    const [pokemon, setPokemon] = useState<Pokemon | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPokemonWithRetry = async (id: number, retries = CONFIG.MAX_RETRIES): Promise<any | null> => {
        for (let i = 0; i < retries; i++) {
            try {
                const res = await fetch(`${CONFIG.API_URL}/pokemon/${id}`);
                if (!res.ok) throw new Error('API error');
                return await res.json();
            } catch (error) {
                if (i === retries - 1) {
                    console.error('Failed to fetch Pokemon after retries', error);
                    return null;
                }
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
        return null;
    };

    const fetchPokemon = useCallback(async () => {
        playSound("beep");
        setLoading(true);
        setError(null);

        await new Promise((resolve) => setTimeout(resolve, CONFIG.LOADING_DELAY));

        const validGens = selectedGens.length > 0 ? selectedGens : [1];
        const randomGenKey = validGens[Math.floor(Math.random() * validGens.length)];
        const [min, max] = GEN_RANGES[randomGenKey];

        const randomId = Math.floor(Math.random() * (max - min + 1)) + min;

        try {
            const data = await fetchPokemonWithRetry(randomId);

            if (!data) {
                setError("CONNECTION ERROR - RETRY?");
                setPokemon(null);
            } else {
                setPokemon({
                    name: data.name,
                    image: data.sprites.front_default,
                    id: data.id,
                    cry: data.cries.latest || data.cries.legacy
                });
                setError(null);
            }
        } catch (error) {
            console.error("Failed to fetch Pokemon", error);
            setError("SYSTEM ERROR - RETRY?");
            setPokemon(null);
        } finally {
            setLoading(false);
        }
    }, [selectedGens, playSound]);

    return {
        pokemon,
        loading,
        error,
        fetchPokemon,
    };
}
