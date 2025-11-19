"use client";

import { useState, useEffect, useRef } from "react";

// --- CONFIGURATION ---
// Ensure these files exist in public/music/
const BGM_PLAYLIST = [
  { title: "Pallet Town", file: "/music/pallet.mp3" },
  { title: "Cinnabar Island", file: "/music/cinnabar.mp3" },
  { title: "Pokemon Center", file: "/music/center.mp3" },
  { title: "Road to Viridian City", file: "/music/roadtoviri.mp3" },
];

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

  // --- AUDIO STATES ---
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false); // New tracking state
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  // --- 1. AUTO-PLAY & UNLOCK STRATEGY ---
  useEffect(() => {
    // 1. Try to play immediately on load
    const attemptPlay = async () => {
      if (bgmRef.current) {
        bgmRef.current.volume = 0.1;
        try {
          await bgmRef.current.play();
          setIsPlaying(true);
          setAudioUnlocked(true);
        } catch (e) {
          // Auto-play blocked. Waiting for interaction.
          console.log("Auto-play blocked. Waiting for user interaction.");
        }
      }
    };

    attemptPlay();
    fetchPokemon();

    // 2. Global Listener: Unlock audio on ANY first click/keypress
    const unlockAudio = () => {
      if (audioUnlocked) return;
      
      // Initialize Web Audio Context (for SFX)
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      ctx.resume();

      // Start BGM if it wasn't playing
      if (bgmRef.current && !isPlaying && !isMuted) {
        bgmRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(e => console.error(e));
      }
      
      setAudioUnlocked(true);
      
      // Clean up listeners
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []); // Run once on mount

  // --- 2. AUDIO CONTROLS ---
  useEffect(() => {
    if (!bgmRef.current) return;
    bgmRef.current.volume = 0.1; 

    if (isPlaying && !isMuted) {
      bgmRef.current.play().catch(() => {});
    } else {
      bgmRef.current.pause();
    }
  }, [isPlaying, isMuted, currentTrackIndex]);

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
    audio.volume = 0.1; 
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
        gain.gain.setValueAtTime(0.1, now); 
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === "success") {
        osc.type = "square";
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.linearRampToValueAtTime(1800, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === "error") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3);
        gain.gain.setValueAtTime(0.15, now);
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
    if (audioUnlocked) playSound("beep"); // Only beep if user has interacted
    setLoading(true);
    setIsRevealed(false);
    setIsWinner(false);
    setGuess("");
    setMessage("");

    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const randomId = Math.floor(Math.random() * 1025) + 1;
    
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

  // --- RENDER ---
  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col md:flex-row items-start justify-center gap-6 p-4">
      
      <audio 
        ref={bgmRef}
        src={BGM_PLAYLIST[currentTrackIndex]?.file}
        onEnded={handleNextTrack} 
        loop={false}
      />

      {/* --- POKEDEX (MAIN UNIT) --- */}
      <div className="order-2 md:order-1 w-full max-w-2xl bg-red-600 rounded-xl shadow-2xl overflow-hidden border-b-8 border-r-8 border-red-800 relative z-10">
        
        {/* Top Decor */}
        <div className="flex items-start p-6 pb-0 gap-6">
            <div className="relative w-24 h-24 rounded-full bg-blue-400 border-8 border-white shadow-inner flex-shrink-0">
            <div className="absolute top-3 left-3 w-8 h-8 bg-white rounded-full opacity-50 blur-[2px]"></div>
            {(loading || isChecking) && <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-50"></div>}
            </div>
            
            <div className="flex gap-3 mt-2">
            <div className={`w-6 h-6 rounded-full border-2 border-red-400 ${isChecking ? 'bg-red-500 animate-pulse' : 'bg-red-900'}`}></div>
            <div className={`w-6 h-6 rounded-full border-2 border-yellow-100 ${isChecking ? 'bg-yellow-300 animate-pulse delay-75' : 'bg-yellow-400'}`}></div>
            <div className={`w-6 h-6 rounded-full border-2 border-green-200 ${isChecking ? 'bg-green-400 animate-pulse delay-150' : 'bg-green-500'}`}></div>
            </div>
        </div>

        {/* Screen */}
        <div className="p-8 pt-6">
            <div className="bg-slate-200 rounded-lg p-8 border-b-4 border-r-4 border-slate-400 relative rounded-bl-[4rem]">
            <div className="bg-slate-700 border-8 border-slate-500 rounded-lg h-80 flex items-center justify-center relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                
                {loading ? (
                <div className="text-center">
                    <div className="font-mono text-2xl text-green-400 animate-pulse mb-2">SEARCHING...</div>
                    <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
                ) : (
                pokemon && (
                    <img
                    src={pokemon.image}
                    alt="Pokemon"
                    className={`w-64 h-64 object-contain z-10 rendering-pixelated transition-all duration-300
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
            <div className="flex justify-between items-center mt-4 px-4">
                <div className={`w-5 h-5 rounded-full bg-red-600 ${loading || isChecking ? "animate-ping" : ""}`}></div>
                <div className="flex flex-col gap-2">
                <div className="w-10 h-1 bg-slate-700"></div>
                <div className="w-10 h-1 bg-slate-700"></div>
                <div className="w-10 h-1 bg-slate-700"></div>
                </div>
            </div>
            </div>
        </div>

        {/* Controls */}
        <div className="px-8 pb-8 space-y-6">
            <div className="bg-green-900 border-4 border-slate-700 rounded p-4 min-h-[4rem] flex items-center justify-center shadow-inner">
            <span className={`font-mono font-bold tracking-widest text-lg md:text-xl 
                ${isChecking ? "animate-pulse text-yellow-400" : ""}
                ${isRevealed && !isWinner ? "text-red-500" : ""}
                ${isRevealed && isWinner ? "text-green-400" : ""}
                ${!isRevealed && !isChecking ? "text-green-400" : ""}
            `}>
                {message || "AWAITING INPUT..."}
            </span>
            </div>

            {!isRevealed ? (
            <form onSubmit={handleGuess} className="flex flex-col gap-4">
                <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                disabled={isChecking}
                placeholder={isChecking ? "PROCESSING..." : "ENTER POKEMON NAME"}
                className="w-full bg-slate-800 text-green-400 font-mono text-xl p-4 rounded border-4 border-slate-600 focus:outline-none focus:border-blue-500 uppercase placeholder:text-slate-600 disabled:opacity-50"
                autoFocus
                />
                <div className="flex gap-4">
                <button 
                    type="submit" 
                    disabled={isChecking}
                    className={`flex-1 text-white text-xl font-bold py-4 rounded shadow-[0_6px_0_rgb(29,78,216)] active:shadow-none active:translate-y-[6px] transition-all uppercase border-2 border-blue-700
                    ${isChecking ? "bg-slate-500 shadow-none translate-y-[6px] border-slate-600" : "bg-blue-500 hover:bg-blue-400"}
                    `}
                >
                    {isChecking ? "SCANNING..." : "SCAN"}
                </button>
                <button 
                    type="button"
                    onClick={handleGiveUp}
                    disabled={isChecking}
                    className="w-1/3 bg-yellow-500 hover:bg-yellow-400 text-yellow-900 text-lg font-bold py-4 rounded shadow-[0_6px_0_rgb(161,98,7)] active:shadow-none active:translate-y-[6px] transition-all uppercase border-2 border-yellow-700 disabled:opacity-50 disabled:shadow-none disabled:translate-y-[6px]"
                >
                    Skip
                </button>
                </div>
            </form>
            ) : (
            <div className="flex gap-2">
                <button 
                onClick={fetchPokemon}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xl font-bold py-5 rounded shadow-[0_6px_0_rgb(0,0,0)] active:shadow-none active:translate-y-[6px] transition-all uppercase border-2 border-slate-900"
                >
                {isWinner ? "Search Next Pokémon" : "Reboot System"}
                </button>
            </div>
            )}
            
            <div className="text-center pt-2">
                <span className="text-red-900 font-bold text-sm uppercase tracking-[0.2em] bg-red-400 px-4 py-2 rounded-full shadow-sm border border-red-800">
                    Current Streak: {streak}
                </span>
            </div>
        </div>
      </div>

      {/* --- MUSIC MODULE (SIDE BAR) --- */}
      <div className="order-1 md:order-2 w-full md:w-64 bg-slate-800 rounded-xl p-4 border-4 border-slate-600 shadow-2xl text-white flex flex-col gap-4 relative">
          {/* Decorative Connector lines */}
          <div className="hidden md:block absolute top-10 -left-6 w-6 h-4 bg-slate-700 border-y-2 border-slate-500"></div>
          <div className="hidden md:block absolute top-20 -left-6 w-6 h-4 bg-slate-700 border-y-2 border-slate-500"></div>

          <div className="flex items-center justify-between border-b border-slate-600 pb-2">
            <span className="font-mono text-xs text-slate-400">AUDIO MODULE</span>
            <div className={`w-3 h-3 rounded-full ${isPlaying && !isMuted ? "bg-green-400 animate-pulse" : "bg-red-500"}`}></div>
          </div>

          {/* Track Info (ALWAYS VISIBLE) */}
          <div className="bg-black rounded p-3 font-mono text-sm border border-slate-600">
              <div className="text-slate-500 text-xs mb-1">{isMuted ? "MUTED" : (isPlaying ? "NOW PLAYING" : "PAUSED")}</div>
              <div className="text-green-400 font-bold truncate scrolling-text">
                  {BGM_PLAYLIST[currentTrackIndex].title}
              </div>
          </div>

          {/* Controls Row */}
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
  );
}