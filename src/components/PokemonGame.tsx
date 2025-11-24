"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePokemonFetch } from "../hooks/usePokemonFetch";
import Pokedex from "./Pokedex";
import GameControls from "./GameControls";
import { useGameMode } from "../contexts/GameScoreContext";

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
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Use GameScore Context
  const { currentStreak, handleWin, handleLoss } = useGameMode('classic');

  // Pokemon fetch hook
  const { pokemon, loading, error, fetchPokemon, gameToken, setPokemon } = usePokemonFetch(
    selectedGens,
    playSound
  );

  // Initial fetch
  useEffect(() => {
    fetchPokemon();
  }, []);

  // Handle guess submission
  const handleGuess = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pokemon || !guess.trim() || isChecking || !gameToken) return;

    setIsChecking(true);
    try {
      const response = await fetch('/api/game/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guess: guess,
          gameToken: gameToken,
          currentStreak: currentStreak,
        }),
      });

      const data = await response.json();

      if (data.success && data.correct) {
        playSound("success");
        // Reveal name and cry
        // We need to fetch reveal data to get the cry if it wasn't in the guess response
        // But wait, the guess response returns correctAnswer.
        // We might need to call reveal to get the cry if we didn't store it.
        // Actually, let's just call reveal to get everything properly.
        // Or better, update guess API to return cry?
        // For now, let's call reveal to be safe and consistent.

        const revealResponse = await fetch('/api/game/reveal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameToken }),
        });
        const revealData = await revealResponse.json();

        if (revealData.success) {
          setPokemon(prev => prev ? { ...prev, name: revealData.name, cry: revealData.cry } : null);
          playCry(revealData.cry);
          setMessage(`MATCH CONFIRMED: ${revealData.name.toUpperCase()}`);
        } else {
          setMessage(`MATCH CONFIRMED: ${data.correctAnswer.toUpperCase()}`);
        }

        setIsWinner(true);
        setIsRevealed(true);
        handleWin();
      } else {
        playSound("error");
        handleLoss();
        setMessage("ERROR: DNA MISMATCH");
      }
    } catch (err) {
      console.error("Guess error:", err);
      setMessage("SYSTEM ERROR");
    } finally {
      setIsChecking(false);
    }
  }, [pokemon, guess, playSound, playCry, isChecking, handleWin, handleLoss, gameToken, currentStreak, setPokemon]);

  // Handle give up
  const handleGiveUp = useCallback(async () => {
    if (!pokemon || !gameToken) return;

    try {
      const response = await fetch('/api/game/reveal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameToken }),
      });

      const data = await response.json();

      if (data.success) {
        setPokemon(prev => prev ? { ...prev, name: data.name, cry: data.cry } : null);
        playSound("error");
        setIsWinner(false);
        setIsRevealed(true);
        handleLoss();
        setMessage(`Species: ${data.name.toUpperCase()}`);
        // Optionally play cry on give up? No, usually just show name.
      }
    } catch (err) {
      console.error("Reveal error:", err);
    }
  }, [pokemon, playSound, handleLoss, gameToken, setPokemon]);

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
              streak={currentStreak}
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