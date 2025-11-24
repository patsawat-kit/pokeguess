import { useState, useCallback } from 'react';
import { CONFIG } from '../constants/gameConfig';

export interface Pokemon {
    name?: string;
    image: string;
    id: number;
    cry?: string;
}

export function usePokemonFetch(selectedGens: number[], playSound: (type: "beep" | "success" | "error") => void) {
    const [pokemon, setPokemon] = useState<Pokemon | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [gameToken, setGameToken] = useState<string | null>(null);

    const fetchPokemon = useCallback(async () => {
        playSound("beep");
        setLoading(true);
        setError(null);
        setGameToken(null);

        // Artificial delay for suspense
        await new Promise((resolve) => setTimeout(resolve, CONFIG.LOADING_DELAY));

        try {
            const response = await fetch('/api/game/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selectedGens,
                    mode: 'classic'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to start game');
            }

            const data = await response.json();

            if (data.success) {
                setPokemon({
                    image: data.imageUrl,
                    id: data.pokemonId,
                    // Name and cry are hidden initially
                });
                setGameToken(data.gameToken);
                setError(null);
            } else {
                setError("SYSTEM ERROR - RETRY?");
                setPokemon(null);
            }
        } catch (error) {
            console.error("Failed to fetch Pokemon", error);
            setError("CONNECTION ERROR - RETRY?");
            setPokemon(null);
        } finally {
            setLoading(false);
        }
    }, [selectedGens, playSound]);

    return {
        pokemon,
        loading,
        error,
        gameToken,
        fetchPokemon,
        setPokemon, // Exporting setPokemon to allow updating it with revealed data
    };
}
