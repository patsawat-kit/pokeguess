"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { APP_VERSION, RELEASE_NOTES } from "../constants/versions";

export default function ReleaseNotes() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasSeenUpdate, setHasSeenUpdate] = useState(true);

    useEffect(() => {
        const lastSeenVersion = localStorage.getItem("lastSeenVersion");
        if (lastSeenVersion !== APP_VERSION) {
            setHasSeenUpdate(false);
            // Delay slightly to not overwhelm user immediately on load
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        setHasSeenUpdate(true);
        localStorage.setItem("lastSeenVersion", APP_VERSION);
    };

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen && !hasSeenUpdate) {
            setHasSeenUpdate(true);
            localStorage.setItem("lastSeenVersion", APP_VERSION);
        }
    };

    return (
        <>
            {/* Persistent Version Badge (Top Left) */}
            <motion.button
                onClick={toggleOpen}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative z-50 group"
            >
                <div className="bg-red-600 text-white font-mono font-bold text-xs px-2 py-3 rounded-full border-2 border-slate-900 shadow-lg flex flex-col items-center gap-1 transition-transform group-hover:scale-105">
                    <span className="opacity-70 writing-mode-vertical-rl" style={{ writingMode: 'vertical-rl' }}>VER.</span>
                    <span className="writing-mode-vertical-rl" style={{ writingMode: 'vertical-rl' }}>{APP_VERSION}</span>
                    {!hasSeenUpdate && (
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                        </span>
                    )}
                </div>
            </motion.button>

            {/* Kalos Pokedex Style Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClose}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ x: '-100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '-100%', opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed top-0 left-0 h-full z-50 flex items-center pointer-events-none"
                        >
                            <div className="ml-4 w-[90vw] md:w-96 max-h-[80vh] flex flex-col relative pointer-events-auto">
                                {/* Pokedex Top Decoration */}
                                <div className="h-4 bg-red-600 rounded-t-xl border-t-2 border-x-2 border-red-400 flex items-center px-4 gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.8)]"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-800"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                                </div>

                                {/* Main Body */}
                                <div className="bg-red-600 p-1 border-x-2 border-b-2 border-red-800 rounded-b-xl shadow-2xl flex flex-col gap-1">

                                    {/* Screen Bezel */}
                                    <div className="bg-slate-900 p-3 rounded-lg border-4 border-slate-800 shadow-inner">

                                        {/* Holographic Screen */}
                                        <div className="bg-sky-900/30 border border-sky-500/30 rounded p-4 relative overflow-hidden min-h-[300px] flex flex-col">
                                            {/* Scanlines effect */}
                                            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,3px_100%]"></div>

                                            {/* Header */}
                                            <div className="relative z-10 flex justify-between items-end border-b border-sky-500/50 pb-2 mb-4">
                                                <div>
                                                    <h2 className="text-sky-300 font-bold text-lg tracking-wider drop-shadow-[0_0_5px_rgba(125,211,252,0.5)]">SYSTEM UPDATE</h2>
                                                    <p className="text-sky-500 text-xs font-mono">PATCH {APP_VERSION}</p>
                                                </div>
                                                <div className="text-sky-400 text-xs font-mono animate-pulse">
                                                    [ONLINE]
                                                </div>
                                            </div>

                                            {/* Scrollable Content */}
                                            <div className="relative z-10 flex-grow overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                                {RELEASE_NOTES.map((note, index) => (
                                                    <div key={index} className="group">
                                                        <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                                                            <span className="w-1 h-1 bg-sky-400 rounded-full"></span>
                                                            {note.title}
                                                        </h3>
                                                        <p className="text-sky-200/80 text-xs leading-relaxed pl-3 border-l border-sky-500/30">
                                                            {note.description}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Footer Action */}
                                            <div className="relative z-10 mt-4 pt-2 border-t border-sky-500/30 flex justify-center">
                                                <button
                                                    onClick={handleClose}
                                                    className="bg-sky-500/20 hover:bg-sky-500/40 text-sky-300 text-xs font-bold py-2 px-6 rounded border border-sky-500/50 transition-all hover:shadow-[0_0_10px_rgba(14,165,233,0.3)] uppercase tracking-widest"
                                                >
                                                    Acknowledge
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Decor */}
                                    <div className="h-6 flex justify-center items-center gap-4">
                                        <div className="w-8 h-1 bg-slate-800 rounded-full"></div>
                                        <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
                                        <div className="w-8 h-1 bg-slate-800 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
