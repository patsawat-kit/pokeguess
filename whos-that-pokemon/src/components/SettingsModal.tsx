import React from 'react';
import { ALL_GENERATIONS } from '../constants/gameConfig';

interface SettingsModalProps {
    showSettings: boolean;
    setShowSettings: (show: boolean) => void;
    isDarkMode: boolean;
    setIsDarkMode: (dark: boolean) => void;
    bgmVolume: number;
    setBgmVolume: (volume: number) => void;
    cryVolume: number;
    setCryVolume: (volume: number) => void;
    sfxVolume: number;
    setSfxVolume: (volume: number) => void;
    selectedGens: number[];
    toggleGen: (gen: number) => void;
    playSound: (type: "beep" | "success" | "error") => void;
}

export default function SettingsModal({
    showSettings,
    setShowSettings,
    isDarkMode,
    setIsDarkMode,
    bgmVolume,
    setBgmVolume,
    cryVolume,
    setCryVolume,
    sfxVolume,
    setSfxVolume,
    selectedGens,
    toggleGen,
    playSound,
}: SettingsModalProps) {
    if (!showSettings) return null;

    const handleClose = () => {
        setShowSettings(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
        >
            <div
                className="bg-slate-800 w-full max-w-md rounded-xl border-4 border-slate-600 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-slate-900 p-4 border-b border-slate-600 flex justify-between items-center shrink-0">
                    <h2 id="settings-title" className="text-green-400 font-mono font-bold text-xl">SYSTEM CONFIG</h2>
                    <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Close settings"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">

                    {/* 1. Theme Toggle */}
                    <div>
                        <label className="text-slate-300 font-mono text-sm block mb-2">VISUAL THEME</label>
                        <div className="flex bg-slate-700 rounded p-1" role="group" aria-label="Theme selection">
                            <button
                                onClick={() => setIsDarkMode(true)}
                                className={`flex-1 py-2 text-sm font-bold rounded transition-all min-h-[44px] ${isDarkMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                aria-pressed={isDarkMode}
                            >
                                DARK
                            </button>
                            <button
                                onClick={() => setIsDarkMode(false)}
                                className={`flex-1 py-2 text-sm font-bold rounded transition-all min-h-[44px] ${!isDarkMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                aria-pressed={!isDarkMode}
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
                                    <label htmlFor="bgm-volume">MUSIC</label>
                                    <span aria-live="polite">{Math.round(bgmVolume * 100)}%</span>
                                </div>
                                <input
                                    id="bgm-volume"
                                    type="range"
                                    min="0" max="1" step="0.05"
                                    value={bgmVolume}
                                    onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                                    style={{
                                        background: `linear-gradient(to right, #facc15 ${bgmVolume * 100}%, #475569 ${bgmVolume * 100}%)`
                                    }}
                                    className="w-full accent-yellow-400 h-2 rounded-lg appearance-none cursor-pointer"
                                    aria-label="Background music volume"
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-valuenow={Math.round(bgmVolume * 100)}
                                />
                            </div>

                            {/* Cries Slider */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-400 font-mono">
                                    <label htmlFor="cry-volume">POKEMON CRIES</label>
                                    <span aria-live="polite">{Math.round(cryVolume * 100)}%</span>
                                </div>
                                <input
                                    id="cry-volume"
                                    type="range"
                                    min="0" max="1" step="0.05"
                                    value={cryVolume}
                                    onChange={(e) => setCryVolume(parseFloat(e.target.value))}
                                    style={{
                                        background: `linear-gradient(to right, #facc15 ${cryVolume * 100}%, #475569 ${cryVolume * 100}%)`
                                    }}
                                    className="w-full accent-yellow-400 h-2 rounded-lg appearance-none cursor-pointer"
                                    aria-label="Pokemon cries volume"
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-valuenow={Math.round(cryVolume * 100)}
                                />
                            </div>

                            {/* SFX Slider */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-400 font-mono">
                                    <label htmlFor="sfx-volume">UI SFX</label>
                                    <span aria-live="polite">{Math.round(sfxVolume * 100)}%</span>
                                </div>
                                <input
                                    id="sfx-volume"
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
                                    aria-label="UI sound effects volume"
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-valuenow={Math.round(sfxVolume * 100)}
                                />
                            </div>

                        </div>
                    </div>

                    {/* 3. Gen Select */}
                    <div>
                        <label className="text-slate-300 font-mono text-sm block mb-2">GENERATION FILTER</label>
                        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Pokemon generation selection">
                            {ALL_GENERATIONS.map((gen) => (
                                <button
                                    key={gen}
                                    onClick={() => toggleGen(gen)}
                                    className={`py-2 text-sm font-mono border-2 rounded transition-all min-h-[44px]
                    ${selectedGens.includes(gen)
                                            ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.3)]'
                                            : 'bg-slate-700 border-slate-600 text-slate-500 hover:border-slate-500'
                                        }`}
                                    aria-pressed={selectedGens.includes(gen)}
                                    aria-label={`Generation ${gen}`}
                                >
                                    GEN {gen}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 p-4 border-t border-slate-600 shrink-0">
                    <button
                        onClick={handleClose}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded shadow-[0_4px_0_rgb(30,58,138)] active:shadow-none active:translate-y-[4px] transition-all min-h-[44px]"
                        aria-label="Save settings and close"
                    >
                        SAVE & CLOSE
                    </button>
                </div>
            </div>
        </div>
    );
}
