"use client";

import { useState, useEffect, useCallback } from "react";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { usePokemonFetch } from "../hooks/usePokemonFetch";
import SettingsModal from "./SettingsModal";
import MusicPlayer from "./MusicPlayer";
import Pokedex from "./Pokedex";
import GameControls from "./GameControls";
import { BGM_PLAYLIST, ALL_GENERATIONS, CONFIG } from "../constants/gameConfig";

export default function PokemonGame() {
  // Game state
  const [guess, setGuess] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState("");

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedGens, setSelectedGens] = useState<number[]>(ALL_GENERATIONS);

  // Audio hooks
  const audioPlayer = useAudioPlayer();
  const soundEffects = useSoundEffects(audioPlayer.isMuted);

  // Pokemon fetch hook
  const { pokemon, loading, error, fetchPokemon } = usePokemonFetch(
    selectedGens,
    soundEffects.playSound
  );

  // Initial fetch
  useEffect(() => {
    fetchPokemon();
  }, []);

  // Handle guess submission
  const handleGuess = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pokemon || isChecking) return;

    setIsChecking(true);
    setMessage("ANALYZING SPECIMEN...");
    soundEffects.playSound("beep");

    await new Promise((resolve) => setTimeout(resolve, CONFIG.CHECKING_DELAY));

    let cleanGuess = guess.toLowerCase().replace(/[^a-z]/g, "");
    const cleanName = pokemon.name.toLowerCase().replace(/[^a-z]/g, "");

    // Handle special cases
    if (cleanGuess === "nidoranfemale") cleanGuess = "nidoranf";
    if (cleanGuess === "nidoranmale") cleanGuess = "nidoranm";

    if (cleanGuess === cleanName) {
      soundEffects.playSound("success");
      soundEffects.playCry(pokemon.cry);
      setIsWinner(true);
      setIsRevealed(true);
      setStreak((prev) => prev + 1);
      setMessage(`MATCH CONFIRMED: ${pokemon.name.toUpperCase()}`);
    } else {
      soundEffects.playSound("error");
      setStreak(0);
      setMessage("ERROR: DNA MISMATCH");
    }
    setIsChecking(false);
  }, [pokemon, isChecking, guess, soundEffects]);

  // Handle give up
  const handleGiveUp = useCallback(() => {
    if (!pokemon) return;
    soundEffects.playSound("error");
    setIsWinner(false);
    setIsRevealed(true);
    setStreak(0);
    setMessage(`Species: ${pokemon.name.toUpperCase()}`);
  }, [pokemon, soundEffects]);

  // Handle new Pokemon fetch
  const handleFetchPokemon = useCallback(() => {
    setIsRevealed(false);
    setIsWinner(false);
    setGuess("");
    setMessage("");
    fetchPokemon();
  }, [fetchPokemon]);

  // Toggle generation selection
  const toggleGen = useCallback((gen: number) => {
    if (selectedGens.includes(gen)) {
      if (selectedGens.length === 1) {
        setMessage("AT LEAST ONE GENERATION REQUIRED");
        soundEffects.playSound("error");
        return;
      }
      setSelectedGens(selectedGens.filter(g => g !== gen));
    } else {
      setSelectedGens([...selectedGens, gen].sort());
    }
  }, [selectedGens, soundEffects]);

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 ${isDarkMode ? 'bg-slate-900' : 'bg-blue-50'}`}>

      {/* Settings Modal */}
      <SettingsModal
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        bgmVolume={audioPlayer.bgmVolume}
        setBgmVolume={audioPlayer.setBgmVolume}
        cryVolume={soundEffects.cryVolume}
        setCryVolume={soundEffects.setCryVolume}
        sfxVolume={soundEffects.sfxVolume}
        setSfxVolume={soundEffects.setSfxVolume}
        selectedGens={selectedGens}
        toggleGen={toggleGen}
        playSound={soundEffects.playSound}
      />

      <div className="relative w-full max-w-4xl mx-auto flex flex-col md:flex-row items-start justify-center gap-4 md:gap-6 p-2 md:p-4 pt-8 md:pt-12">

        {/* Settings Toggle Button */}
        <button
          onClick={() => setShowSettings(true)}
          className="absolute top-2 right-2 md:right-0 z-40 p-2 bg-slate-700 rounded-full hover:bg-slate-600 border-2 border-slate-500 text-slate-300 shadow-lg transition-transform hover:scale-110 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
          title="Configure Settings"
          aria-label="Open settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </button>

        {/* Background Music Audio Element */}
        <audio
          ref={audioPlayer.bgmRef}
          src={BGM_PLAYLIST[audioPlayer.currentTrackIndex]?.file}
          onEnded={audioPlayer.handleNextTrack}
          loop={false}
        />

        {/* Pokedex with Game Controls */}
        <div className="order-2 md:order-1 w-full max-w-2xl bg-red-600 rounded-xl shadow-2xl overflow-hidden border-b-8 border-r-8 border-red-800 relative z-10">
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

        {/* Music Player */}
        <MusicPlayer
          isMuted={audioPlayer.isMuted}
          isPlaying={audioPlayer.isPlaying}
          currentTrackIndex={audioPlayer.currentTrackIndex}
          toggleMute={audioPlayer.toggleMute}
          togglePlayMusic={audioPlayer.togglePlayMusic}
          handleNextTrack={audioPlayer.handleNextTrack}
        />
      </div>
    </div>
  );
}