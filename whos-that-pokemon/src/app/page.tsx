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

type ViewType = 'silhouette' | 'trivia' | 'stats';

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

      {/* GLOBAL MUSIC PLAYER WIDGET */}
      <MusicPlayer
        isMuted={audioPlayer.isMuted}
        isPlaying={audioPlayer.isPlaying}
        currentTrackIndex={audioPlayer.currentTrackIndex}
        toggleMute={audioPlayer.toggleMute}
        togglePlayMusic={audioPlayer.togglePlayMusic}
        handleNextTrack={audioPlayer.handleNextTrack}
      />

      {/* Background Music Audio Element */}
      <audio
        ref={audioPlayer.bgmRef}
        src={BGM_PLAYLIST[audioPlayer.currentTrackIndex]?.file}
        onEnded={audioPlayer.handleNextTrack}
        loop={false}
      />

      {/* NAVIGATION BAR */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onSettingsClick={() => setShowSettings(true)}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow flex flex-col items-center justify-start p-4 z-10 overflow-y-auto">
        <div id="game-container" className="w-full max-w-5xl mt-8">
          <AnimatePresence mode="wait">
            {currentView === 'silhouette' && (
              <motion.div
                key="silhouette"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
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
              >
                <TrainerStats />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER / CREDITS */}
        <div className="mt-12 mb-8 text-slate-500 text-sm font-sans font-medium tracking-wide text-center">
          Project by <a href="https://ptswt.site" className="text-slate-400 hover:text-white transition underline decoration-slate-600">patsawat.kit</a>
          <span className="mx-2">•</span>
          Built with Next.js & Tailwind
        </div>
      </div>
    </main>
  );
}