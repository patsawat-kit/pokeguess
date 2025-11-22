import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BGM_PLAYLIST } from '../constants/gameConfig';

interface MusicPlayerProps {
    isMuted: boolean;
    isPlaying: boolean;
    currentTrackIndex: number;
    toggleMute: () => void;
    togglePlayMusic: () => void;
    handleNextTrack: () => void;
}

export default function MusicPlayer({
    isMuted,
    isPlaying,
    currentTrackIndex,
    toggleMute,
    togglePlayMusic,
    handleNextTrack,
}: MusicPlayerProps) {
    const [isMinimized, setIsMinimized] = useState(false);

    // Auto-minimize on mobile on initial load
    useEffect(() => {
        if (window.innerWidth < 768) {
            setIsMinimized(true);
        }
    }, []);

    return (
        <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
            <AnimatePresence mode="wait">
                {isMinimized ? (
                    <motion.button
                        key="minimized"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsMinimized(false)}
                        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center border-2 border-white transition-colors ${isPlaying && !isMuted ? 'bg-green-500 animate-pulse' : 'bg-slate-700'
                            }`}
                        aria-label="Expand music player"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                        </svg>
                    </motion.button>
                ) : (
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="w-full max-w-[calc(100vw-2rem)] md:max-w-xs md:w-64 bg-slate-800 rounded-xl p-4 border-4 border-slate-600 shadow-2xl text-white flex flex-col gap-4"
                    >
                        <div className="flex items-center justify-between border-b border-slate-600 pb-2">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-slate-400">AUDIO MODULE</span>
                                <div
                                    className={`w-3 h-3 rounded-full ${isPlaying && !isMuted ? "bg-green-400 animate-pulse" : "bg-red-500"}`}
                                    role="status"
                                    aria-label={isPlaying && !isMuted ? "Playing" : "Stopped"}
                                ></div>
                            </div>
                            <button
                                onClick={() => setIsMinimized(true)}
                                className="text-slate-400 hover:text-white transition-colors"
                                aria-label="Minimize music player"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>
                        </div>

                        <div className="bg-black rounded p-3 font-mono text-sm border border-slate-600">
                            <div className="text-slate-500 text-xs mb-1">{isMuted ? "MUTED" : (isPlaying ? "NOW PLAYING" : "PAUSED")}</div>
                            <div className="text-green-400 font-bold truncate scrolling-text">
                                {BGM_PLAYLIST[currentTrackIndex].title}
                            </div>
                        </div>

                        <div className="flex justify-between items-center bg-slate-700 rounded-lg p-2" role="group" aria-label="Music controls">
                            {/* Mute */}
                            <button
                                onClick={toggleMute}
                                className={`p-2 rounded hover:bg-slate-600 min-w-[44px] min-h-[44px] flex items-center justify-center ${isMuted ? "text-red-400" : "text-green-400"}`}
                                aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                                aria-pressed={isMuted}
                            >
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
                            <button
                                onClick={togglePlayMusic}
                                className="p-2 rounded hover:bg-slate-600 text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
                                aria-label={isPlaying && !isMuted ? "Pause music" : "Play music"}
                            >
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
                            <button
                                onClick={handleNextTrack}
                                className="p-2 rounded hover:bg-slate-600 text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
                                aria-label="Skip to next track"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
                                </svg>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
