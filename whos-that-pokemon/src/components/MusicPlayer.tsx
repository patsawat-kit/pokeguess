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
    return (
        <div className="order-1 md:order-2 w-full md:w-64 bg-slate-800 rounded-xl p-4 border-4 border-slate-600 shadow-2xl text-white flex flex-col gap-4 relative z-30">
            {/* Decorative Connector lines */}
            <div className="hidden md:block absolute top-10 -left-6 w-6 h-4 bg-slate-700 border-y-2 border-slate-500"></div>
            <div className="hidden md:block absolute top-20 -left-6 w-6 h-4 bg-slate-700 border-y-2 border-slate-500"></div>

            <div className="flex items-center justify-between border-b border-slate-600 pb-2">
                <span className="font-mono text-xs text-slate-400">AUDIO MODULE</span>
                <div
                    className={`w-3 h-3 rounded-full ${isPlaying && !isMuted ? "bg-green-400 animate-pulse" : "bg-red-500"}`}
                    role="status"
                    aria-label={isPlaying && !isMuted ? "Playing" : "Stopped"}
                ></div>
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
        </div>
    );
}
