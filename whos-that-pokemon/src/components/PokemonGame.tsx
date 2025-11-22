"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePokemonFetch } from "../hooks/usePokemonFetch";
import Pokedex from "./Pokedex";
import GameControls from "./GameControls";
import { CONFIG } from "../constants/gameConfig";
import { updateStreak, checkDailyStreak, getStats } from "../utils/statsManager";

interface PokemonGameProps {
  selectedGens: number[];
  playSound: (type: "beep" | "success" | "error") => void;
  playCry: (url: string) => void;
  isDarkMode: boolean;
}

export default function PokemonGame({ selectedGens, playSound, playCry, isDarkMode }: PokemonGameProps) {
  // Game state
  const [guess, setGuess] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState("");

  // Pokemon fetch hook
  const { pokemon, loading, error, fetchPokemon } = usePokemonFetch(
    selectedGens,
    playSound
  );

  // Initial fetch
  useEffect(() => {
    fetchPokemon();
  }, []);

  // Stats Integration
  useEffect(() => {
    checkDailyStreak('silhouette');
    const stats = getStats('silhouette');
    setStreak(stats.currentStreak);
  }, []);

  // Handle guess submission
  const handleGuess = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pokemon || isChecking) return;

    setIsChecking(true);
    setMessage("ANALYZING SPECIMEN...");
    playSound("beep");

    await new Promise((resolve) => setTimeout(resolve, CONFIG.CHECKING_DELAY));

    let cleanGuess = guess.toLowerCase().replace(/[^a-z]/g, "");
    const cleanName = pokemon.name.toLowerCase().replace(/[^a-z]/g, "");

    // Handle special cases
    if (cleanGuess === "nidoranfemale") cleanGuess = "nidoranf";
    if (cleanGuess === "nidoranmale") cleanGuess = "nidoranm";

    if (cleanGuess === cleanName) {
      playSound("success");
      playCry(pokemon.cry);
      setIsWinner(true);
      setIsRevealed(true);

      const newStats = updateStreak('silhouette', true);
      setStreak(newStats.currentStreak);

      setMessage(`MATCH CONFIRMED: ${pokemon.name.toUpperCase()}`);
    } else {
      playSound("error");

      const newStats = updateStreak('silhouette', false);
      setStreak(newStats.currentStreak);

      setMessage("ERROR: DNA MISMATCH");
    }
    setIsChecking(false);
  }, [pokemon, isChecking, guess, playSound, playCry]);

  // Handle give up
  const handleGiveUp = useCallback(() => {
    if (!pokemon) return;
    playSound("error");
    setIsWinner(false);
    setIsRevealed(true);

    const newStats = updateStreak('silhouette', false);
    setStreak(newStats.currentStreak);

    setMessage(`Species: ${pokemon.name.toUpperCase()}`);
  }, [pokemon, playSound]);

  // Handle new Pokemon fetch
  const handleFetchPokemon = useCallback(() => {
    setIsRevealed(false);
    setIsWinner(false);
    setGuess("");
    setMessage("");
    fetchPokemon();
  }, [fetchPokemon]);

  return (
    <div className={`w-full transition-colors duration-500 ${isDarkMode ? 'bg-slate-900' : 'bg-blue-50'}`}>
      <div className="relative w-full max-w-2xl mx-auto p-4 pt-8">

        {/* POKEDEX CONTAINER */}
        <div className="relative z-10 w-full">

          {/* POKEDEX HEADER */}
          <div className="bg-red-600 rounded-t-xl p-4 border-4 border-b-0 border-red-800 shadow-lg relative">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-400 border-4 border-white shadow-inner animate-pulse"></div>
                <div className="w-3 h-3 rounded-full bg-red-400 border border-red-800"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-800"></div>
                <div className="w-3 h-3 rounded-full bg-green-400 border border-green-800"></div>
              </div>
            </div>
          </div>

          {/* Pokedex Body with Game Controls */}
          <div className="bg-red-600 rounded-b-xl shadow-2xl overflow-hidden border-4 border-t-0 border-red-800 relative z-10 pb-4">
            <Pokedex
              loading={loading}
              isChecking={isChecking}
              pokemon={pokemon}
              isRevealed={isRevealed}
            />

            <GameControls
              pokemon={pokemon}
              guess={guess}
              setGuess={setGuess}
              isRevealed={isRevealed}
              isWinner={isWinner}
              isChecking={isChecking}
              message={message}
              streak={streak}
              error={error}
              handleGuess={handleGuess}
              handleGiveUp={handleGiveUp}
              fetchPokemon={handleFetchPokemon}
            />
          </div>
        </div>
      </div>
    </div>
  );
}