"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PokemonGame from "@/src/components/PokemonGame";
import Navbar from "@/src/components/Navbar";
import TriviaMode from "@/src/components/TriviaMode";
import TrainerStats from "@/src/components/TrainerStats";
import SettingsModal from "@/src/components/SettingsModal";
import MusicPlayer from "@/src/components/MusicPlayer";
import { useAudioPlayer } from "@/src/hooks/useAudioPlayer";
import { useSoundEffects } from "@/src/hooks/useSoundEffects";
import { ALL_GENERATIONS, BGM_PLAYLIST } from "@/src/constants/gameConfig";
import ReleaseNotes from "@/src/components/ReleaseNotes";
import Leaderboard from "@/src/components/Leaderboard";

type ViewType = 'silhouette' | 'trivia' | 'stats' | 'leaderboard';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('silhouette');

  // Global Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedGens, setSelectedGens] = useState<number[]>(ALL_GENERATIONS);

  // Global Audio State
  const audioPlayer = useAudioPlayer();
  const soundEffects = useSoundEffects(audioPlayer.isMuted);

  // Toggle generation selection
  const toggleGen = useCallback((gen: number) => {
    if (selectedGens.includes(gen)) {
      if (selectedGens.length === 1) {
        soundEffects.playSound("error");
        return;
      }
      setSelectedGens(selectedGens.filter(g => g !== gen));
    } else {
      setSelectedGens([...selectedGens, gen].sort());
    }
  }, [selectedGens, soundEffects]);

  return (
    <main className={`min-h-screen flex flex-col overflow-hidden relative transition-colors duration-500 ${isDarkMode ? 'bg-slate-900' : 'bg-blue-50'}`}>

      {/* BACKGROUND PATTERN LAYER */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px), radial-gradient(#ffffff 2px, transparent 2px)',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px',
          }}
        ></div>
      </div>

      {/* Optional: A large decorative blurred glow behind the content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600 rounded-full blur-[120px] opacity-20 pointer-events-none z-0"></div>


      {/* BACKGROUND MUSIC AUDIO ELEMENT */}
      <audio
        ref={audioPlayer.bgmRef}
        src={BGM_PLAYLIST[audioPlayer.currentTrackIndex].file}
        loop
        preload="auto"
        onEnded={audioPlayer.handleNextTrack}
      />

      {/* RELEASE NOTES - Fixed to middle-left of content area */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40">
        <ReleaseNotes />
      </div>

      {/* GLOBAL SETTINGS MODAL */}
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
        currentView={currentView}
      />

      {/* MUSIC PLAYER */}
      <MusicPlayer
        isMuted={audioPlayer.isMuted}
        isPlaying={audioPlayer.isPlaying}
        currentTrackIndex={audioPlayer.currentTrackIndex}
        toggleMute={audioPlayer.toggleMute}
        togglePlayMusic={audioPlayer.togglePlayMusic}
        handleNextTrack={audioPlayer.handleNextTrack}
      />

      {/* NAVBAR Z-INDEX: 50 */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onSettingsClick={() => setShowSettings(true)}
      />

      {/* MAIN CONTENT Z-INDEX: 10 */}
      <div className="relative z-10 flex-grow flex items-center justify-center px-4 py-8 overflow-auto">
        <AnimatePresence mode="wait">
          {currentView === 'silhouette' && (
            <motion.div
              key="silhouette"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-5xl"
            >
              <PokemonGame
                selectedGens={selectedGens}
                playSound={soundEffects.playSound}
                playCry={soundEffects.playCry}
                isDarkMode={isDarkMode}
              />
            </motion.div>
          )}

          {currentView === 'trivia' && (
            <motion.div
              key="trivia"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-5xl"
            >
              <TriviaMode />
            </motion.div>
          )}

          {currentView === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-5xl"
            >
              <TrainerStats />
            </motion.div>
          )}

          {currentView === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-5xl"
            >
              <Leaderboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
