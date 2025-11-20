"use client";

import { useState, useEffect, useRef } from "react";

// --- CONFIGURATION ---
const BGM_PLAYLIST = [
  { title: "Pallet Town", file: "/music/pallet.mp3" },
  { title: "Cinnabar Island", file: "/music/cinnabar.mp3" },
  { title: "Pokemon Center", file: "/music/center.mp3" },
  { title: "Road to Viridian City", file: "/music/roadtoviri.mp3" },
];

const GEN_RANGES: Record<number, [number, number]> = {
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
  5: [494, 649],
  6: [650, 721],
  7: [722, 809],
  8: [810, 905],
  9: [906, 1025],
};

interface Pokemon {
  name: string;
  image: string;
  id: number;
  cry: string;
}

export default function PokemonGame() {
  // --- GAME STATES ---
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [guess, setGuess] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState("");

  // --- SETTINGS STATES ---
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedGens, setSelectedGens] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  // --- AUDIO STATES ---
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  
  // --- VOLUME STATES ---
  const [bgmVolume, setBgmVolume] = useState(0.1); 
  const [cryVolume, setCryVolume] = useState(0.3); 
  const [sfxVolume, setSfxVolume] = useState(0.1); 

  const bgmRef = useRef<HTMLAudioElement | null>(null);

  // --- 1. AUTO-PLAY & UNLOCK STRATEGY ---
  useEffect(() => {
    const attemptPlay = async () => {
      if (bgmRef.current) {
        bgmRef.current.volume = bgmVolume;
        try {
          await bgmRef.current.play();
          setIsPlaying(true);
          setAudioUnlocked(true);
        } catch (e) {
          console.log("Auto-play blocked.");
        }
      }
    };

    attemptPlay();
    fetchPokemon();

    const unlockAudio = () => {
      if (audioUnlocked) return;
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      ctx.resume();
      if (bgmRef.current && !isPlaying && !isMuted) {
        bgmRef.current.volume = bgmVolume;
        bgmRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(e => console.error(e));
      }
      setAudioUnlocked(true);
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // --- 2. AUDIO CONTROLS ---
  useEffect(() => {
    if (!bgmRef.current) return;
    if (isPlaying && !isMuted) {
      bgmRef.current.play().catch(() => {});
    } else {
      bgmRef.current.pause();
    }
  }, [isPlaying, isMuted, currentTrackIndex]);

  useEffect(() => {
    if (bgmRef.current) {
        bgmRef.current.volume = bgmVolume;
    }
  }, [bgmVolume]);

  const toggleMute = () => setIsMuted(!isMuted);
  
  const handleNextTrack = () => {
    let next = currentTrackIndex + 1;
    if (next >= BGM_PLAYLIST.length) next = 0;
    setCurrentTrackIndex(next);
    if (!isMuted) setIsPlaying(true);
  };
  
  const togglePlayMusic = () => setIsPlaying(!isPlaying);

  // --- 3. SFX HELPERS ---
  const playCry = (url: string) => {
    if (isMuted || !url) return;
    const audio = new Audio(url);
    audio.volume = cryVolume; 
    audio.play().catch(() => {});
  };

  const playSound = (type: "beep" | "success" | "error") => {
    if (isMuted) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      if (type === "beep") {
        osc.type = "sawtooth"; 
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
        gain.gain.setValueAtTime(sfxVolume, now); 
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === "success") {
        osc.type = "square";
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.linearRampToValueAtTime(1800, now + 0.1);
        gain.gain.setValueAtTime(sfxVolume, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === "error") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3);
        gain.gain.setValueAtTime(sfxVolume, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
      osc.connect(gain);
      gain.connect(ctx.destination);
    } catch (e) { console.error("Audio play failed", e); }
  };

  // --- 4. GAME LOGIC ---
  const fetchPokemon = async () => {
    if (audioUnlocked) playSound("beep");
    setLoading(true);
    setIsRevealed(false);
    setIsWinner(false);
    setGuess("");
    setMessage("");

    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const validGens = selectedGens.length > 0 ? selectedGens : [1];
    const randomGenKey = validGens[Math.floor(Math.random() * validGens.length)];
    const [min, max] = GEN_RANGES[randomGenKey];
    
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const data = await res.json();
      setPokemon({
        name: data.name,
        image: data.sprites.front_default, 
        id: data.id,
        cry: data.cries.latest || data.cries.legacy
      });
    } catch (error) { console.error("Failed to fetch Pokemon", error); } 
    finally { setLoading(false); }
  };

  const handleGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pokemon || isChecking) return;

    setIsChecking(true);
    setMessage("ANALYZING SPECIMEN...");
    playSound("beep"); 

    await new Promise((resolve) => setTimeout(resolve, 1500));

    let cleanGuess = guess.toLowerCase().replace(/[^a-z]/g, "");
    const cleanName = pokemon.name.toLowerCase().replace(/[^a-z]/g, "");

    if (cleanGuess === "nidoranfemale") cleanGuess = "nidoranf";
    if (cleanGuess === "nidoranmale") cleanGuess = "nidoranm";

    if (cleanGuess === cleanName) {
      playSound("success"); 
      playCry(pokemon.cry); 
      setIsWinner(true);
      setIsRevealed(true);
      setStreak((prev) => prev + 1);
      setMessage(`MATCH CONFIRMED: ${pokemon.name.toUpperCase()}`);
    } else {
      playSound("error");
      setStreak(0);
      setMessage("ERROR: DNA MISMATCH");
    }
    setIsChecking(false);
  };

  const handleGiveUp = () => {
    if (!pokemon) return;
    playSound("error");
    setIsWinner(false);
    setIsRevealed(true);
    setStreak(0);
    setMessage(`Species: ${pokemon.name.toUpperCase()}`);
  };

  const toggleGen = (gen: number) => {
    if (selectedGens.includes(gen)) {
      if (selectedGens.length > 1) {
        setSelectedGens(selectedGens.filter(g => g !== gen));
      }
    } else {
      setSelectedGens([...selectedGens, gen].sort());
    }
  };

  // --- RENDER ---
  return (
    <div className={`min-h-screen w-full transition-colors duration-500 ${isDarkMode ? 'bg-slate-900' : 'bg-blue-50'}`}>
      
      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 w-full max-w-md rounded-xl border-4 border-slate-600 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 p-4 border-b border-slate-600 flex justify-between items-center shrink-0">
              <h2 className="text-green-400 font-mono font-bold text-xl">SYSTEM CONFIG</h2>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              
              {/* 1. Theme Toggle */}
              <div>
                <label className="text-slate-300 font-mono text-sm block mb-2">VISUAL THEME</label>
                <div className="flex bg-slate-700 rounded p-1">
                  <button 
                    onClick={() => setIsDarkMode(true)}
                    className={`flex-1 py-2 text-sm font-bold rounded transition-all ${isDarkMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    DARK
                  </button>
                  <button 
                    onClick={() => setIsDarkMode(false)}
                    className={`flex-1 py-2 text-sm font-bold rounded transition-all ${!isDarkMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    LIGHT
                  </button>
                </div>
              </div>

              {/* 2. Audio Levels */}
              <div>
                <label className="text-slate-300 font-mono text-sm block mb-3">AUDIO LEVELS</label>
                <div className="space-y-4 bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                  
                  {/* BGM Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400 font-mono">
                        <span>MUSIC</span>
                        <span>{Math.round(bgmVolume * 100)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" max="1" step="0.05" 
                        value={bgmVolume}
                        onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                        // Using linear-gradient to create the "filled" yellow bar effect
                        style={{
                          background: `linear-gradient(to right, #facc15 ${bgmVolume * 100}%, #475569 ${bgmVolume * 100}%)`
                        }}
                        className="w-full accent-yellow-400 h-2 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                   {/* Cries Slider */}
                   <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400 font-mono">
                        <span>POKEMON CRIES</span>
                        <span>{Math.round(cryVolume * 100)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" max="1" step="0.05" 
                        value={cryVolume}
                        onChange={(e) => setCryVolume(parseFloat(e.target.value))}
                        style={{
                          background: `linear-gradient(to right, #facc15 ${cryVolume * 100}%, #475569 ${cryVolume * 100}%)`
                        }}
                        className="w-full accent-yellow-400 h-2 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                   {/* SFX Slider */}
                   <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400 font-mono">
                        <span>UI SFX</span>
                        <span>{Math.round(sfxVolume * 100)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" max="1" step="0.05" 
                        value={sfxVolume}
                        onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                        onMouseUp={() => playSound("beep")} 
                        onTouchEnd={() => playSound("beep")}
                        style={{
                          background: `linear-gradient(to right, #facc15 ${sfxVolume * 100}%, #475569 ${sfxVolume * 100}%)`
                        }}
                        className="w-full accent-yellow-400 h-2 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                </div>
              </div>

              {/* 3. Gen Select */}
              <div>
                <label className="text-slate-300 font-mono text-sm block mb-2">GENERATION FILTER</label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((gen) => (
                    <button
                      key={gen}
                      onClick={() => toggleGen(gen)}
                      className={`py-2 text-sm font-mono border-2 rounded transition-all
                        ${selectedGens.includes(gen) 
                          ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.3)]' 
                          : 'bg-slate-700 border-slate-600 text-slate-500 hover:border-slate-500'
                        }`}
                    >
                      GEN {gen}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-4 border-t border-slate-600 shrink-0">
              <button 
                onClick={() => setShowSettings(false)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded shadow-[0_4px_0_rgb(30,58,138)] active:shadow-none active:translate-y-[4px] transition-all"
              >
                SAVE & CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-4xl mx-auto flex flex-col md:flex-row items-start justify-center gap-4 md:gap-6 p-2 md:p-4 pt-8 md:pt-12">
        
        {/* Settings Toggle Button */}
        <button 
            onClick={() => setShowSettings(true)}
            className="absolute top-2 right-2 md:right-0 z-40 p-2 bg-slate-700 rounded-full hover:bg-slate-600 border-2 border-slate-500 text-slate-300 shadow-lg transition-transform hover:scale-110 active:scale-95"
            title="Configure Settings"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
        </button>

        <audio 
          ref={bgmRef}
          src={BGM_PLAYLIST[currentTrackIndex]?.file}
          onEnded={handleNextTrack} 
          loop={false}
        />

        {/* --- POKEDEX (MAIN UNIT) --- */}
        <div className="order-2 md:order-1 w-full max-w-2xl bg-red-600 rounded-xl shadow-2xl overflow-hidden border-b-8 border-r-8 border-red-800 relative z-10">
          
          {/* Top Decor */}
          <div className="flex items-start p-4 md:p-6 pb-0 gap-4 md:gap-6">
              <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-full bg-blue-400 border-4 md:border-8 border-white shadow-inner flex-shrink-0 transition-all">
                  <div className="absolute top-2 left-2 md:top-3 md:left-3 w-4 h-4 md:w-8 md:h-8 bg-white rounded-full opacity-50 blur-[2px]"></div>
                  {(loading || isChecking) && <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-50"></div>}
              </div>
              
              <div className="flex gap-2 md:gap-3 mt-1 md:mt-2">
                  <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full border-2 border-red-400 ${isChecking ? 'bg-red-500 animate-pulse' : 'bg-red-900'}`}></div>
                  <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full border-2 border-yellow-100 ${isChecking ? 'bg-yellow-300 animate-pulse delay-75' : 'bg-yellow-400'}`}></div>
                  <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full border-2 border-green-200 ${isChecking ? 'bg-green-400 animate-pulse delay-150' : 'bg-green-500'}`}></div>
              </div>
          </div>

          {/* Screen Area */}
          <div className="p-4 md:p-8 pt-4 md:pt-6">
              <div className="bg-slate-200 rounded-lg p-4 md:p-8 border-b-4 border-r-4 border-slate-400 relative rounded-bl-[2rem] md:rounded-bl-[4rem]">
              
              <div className="bg-slate-700 border-4 md:border-8 border-slate-500 rounded-lg h-48 sm:h-64 md:h-80 flex items-center justify-center relative overflow-hidden shadow-inner transition-all">
                  <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                  
                  {loading ? (
                  <div className="text-center">
                      <div className="font-mono text-lg md:text-2xl text-green-400 animate-pulse mb-2">SEARCHING...</div>
                      <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                  ) : (
                  pokemon && (
                      <img
                      src={pokemon.image}
                      alt="Pokemon"
                      className={`w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 object-contain z-10 rendering-pixelated transition-all duration-300
                          ${isRevealed 
                          ? "brightness-100 filter-none scale-110" 
                          : "brightness-0 contrast-200 opacity-60"
                          }
                          ${isChecking ? "animate-pulse opacity-80 scale-105" : ""} 
                      `}
                      />
                  )
                  )}
              </div>
              <div className="flex justify-between items-center mt-4 px-2 md:px-4">
                  <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full bg-red-600 ${loading || isChecking ? "animate-ping" : ""}`}></div>
                  <div className="flex flex-col gap-2">
                      <div className="w-8 md:w-10 h-1 bg-slate-700"></div>
                      <div className="w-8 md:w-10 h-1 bg-slate-700"></div>
                      <div className="w-8 md:w-10 h-1 bg-slate-700"></div>
                  </div>
              </div>
              </div>
          </div>

          {/* Controls Area */}
          <div className="px-4 md:px-8 pb-4 md:pb-8 space-y-4 md:space-y-6">
              <div className="bg-green-900 border-4 border-slate-700 rounded p-2 md:p-4 min-h-[3rem] md:min-h-[4rem] flex items-center justify-center shadow-inner">
              <span className={`font-mono font-bold tracking-widest text-base md:text-xl text-center
                  ${isChecking ? "animate-pulse text-yellow-400" : ""}
                  ${isRevealed && !isWinner ? "text-red-500" : ""}
                  ${isRevealed && isWinner ? "text-green-400" : ""}
                  ${!isRevealed && !isChecking ? "text-green-400" : ""}
              `}>
                  {message || "AWAITING INPUT..."}
              </span>
              </div>

              {!isRevealed ? (
              <form onSubmit={handleGuess} className="flex flex-col gap-3 md:gap-4">
                  <input
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  disabled={isChecking}
                  placeholder={isChecking ? "PROCESSING..." : "ENTER POKEMON NAME"}
                  className="w-full bg-slate-800 text-green-400 font-mono text-base md:text-xl p-3 md:p-4 rounded border-4 border-slate-600 focus:outline-none focus:border-blue-500 placeholder:text-slate-600 disabled:opacity-50"
                  autoFocus
                  />
                  <div className="flex gap-3 md:gap-4">
                  <button 
                      type="submit" 
                      disabled={isChecking}
                      className={`flex-1 text-white text-lg md:text-xl font-bold py-3 md:py-4 rounded shadow-[0_4px_0_rgb(29,78,216)] md:shadow-[0_6px_0_rgb(29,78,216)] active:shadow-none active:translate-y-[4px] md:active:translate-y-[6px] transition-all border-2 border-blue-700
                      ${isChecking ? "bg-slate-500 shadow-none translate-y-[6px] border-slate-600" : "bg-blue-500 hover:bg-blue-400"}
                      `}
                  >
                      {isChecking ? "SCANNING..." : "SCAN"}
                  </button>
                  <button 
                      type="button"
                      onClick={handleGiveUp}
                      disabled={isChecking}
                      className="w-1/3 bg-yellow-500 hover:bg-yellow-400 text-yellow-900 text-lg md:text-lg font-bold py-3 md:py-4 rounded shadow-[0_4px_0_rgb(161,98,7)] md:shadow-[0_6px_0_rgb(161,98,7)] active:shadow-none active:translate-y-[4px] md:active:translate-y-[6px] transition-all border-2 border-yellow-700 disabled:opacity-50 disabled:shadow-none disabled:translate-y-[6px]"
                  >
                      Skip
                  </button>
                  </div>
              </form>
              ) : (
              <div className="flex gap-2">
                  <button 
                  onClick={fetchPokemon}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white text-lg md:text-xl font-bold py-4 md:py-5 rounded shadow-[0_6px_0_rgb(0,0,0)] active:shadow-none active:translate-y-[6px] transition-all border-2 border-slate-900"
                  >
                  {isWinner ? "Search Next Pokémon" : "Reboot System"}
                  </button>
              </div>
              )}
              
              <div className="text-center pt-1 md:pt-2">
                  <span className="text-green-900 font-bold text-xs md:text-sm tracking-[0.2em] bg-green-400 px-4 py-2 rounded shadow-sm border border-red-800">
                      Current Streak: {streak}
                  </span>
              </div>
          </div>
        </div>

        {/* --- MUSIC MODULE (SIDE BAR) --- */}
        <div className="order-1 md:order-2 w-full md:w-64 bg-slate-800 rounded-xl p-4 border-4 border-slate-600 shadow-2xl text-white flex flex-col gap-4 relative z-30">
            {/* Decorative Connector lines */}
            <div className="hidden md:block absolute top-10 -left-6 w-6 h-4 bg-slate-700 border-y-2 border-slate-500"></div>
            <div className="hidden md:block absolute top-20 -left-6 w-6 h-4 bg-slate-700 border-y-2 border-slate-500"></div>

            <div className="flex items-center justify-between border-b border-slate-600 pb-2">
              <span className="font-mono text-xs text-slate-400">AUDIO MODULE</span>
              <div className={`w-3 h-3 rounded-full ${isPlaying && !isMuted ? "bg-green-400 animate-pulse" : "bg-red-500"}`}></div>
            </div>

            <div className="bg-black rounded p-3 font-mono text-sm border border-slate-600">
                <div className="text-slate-500 text-xs mb-1">{isMuted ? "MUTED" : (isPlaying ? "NOW PLAYING" : "PAUSED")}</div>
                <div className="text-green-400 font-bold truncate scrolling-text">
                    {BGM_PLAYLIST[currentTrackIndex].title}
                </div>
            </div>

            <div className="flex justify-between items-center bg-slate-700 rounded-lg p-2">
              {/* Mute */}
              <button onClick={toggleMute} className={`p-2 rounded hover:bg-slate-600 ${isMuted ? "text-red-400" : "text-green-400"}`}>
                  {isMuted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                      </svg>
                  ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                      </svg>
                  )}
              </button>

              {/* Play/Pause */}
              <button onClick={togglePlayMusic} className="p-2 rounded hover:bg-slate-600 text-white">
                  {isPlaying && !isMuted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                      </svg>
                  ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                      </svg>
                  )}
              </button>

              {/* Skip */}
              <button onClick={handleNextTrack} className="p-2 rounded hover:bg-slate-600 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
                  </svg>
              </button>
            </div>
        </div>

      </div>
    </div>
  );
}