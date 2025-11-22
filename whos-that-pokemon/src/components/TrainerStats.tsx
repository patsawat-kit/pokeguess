"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getStats, ModeStats } from "../utils/statsManager";

export default function TrainerStats() {
    const [silhouetteStats, setSilhouetteStats] = useState<ModeStats | null>(null);
    const [triviaStats, setTriviaStats] = useState<ModeStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const sStats = getStats('silhouette');
        const tStats = getStats('trivia');
        setSilhouetteStats(sStats);
        setTriviaStats(tStats);
        setLoading(false);
    }, []);

    if (loading) {
        return <div className="text-white text-center p-8">LOADING TRAINER DATA...</div>;
    }

    const maxDailyStreak = Math.max(
        silhouetteStats?.dailyStreak || 0,
        triviaStats?.dailyStreak || 0
    );

    const totalWins = (silhouetteStats?.currentStreak || 0) + (triviaStats?.currentStreak || 0); // Just a simple sum for now

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 rounded-xl overflow-hidden border-4 border-slate-600 shadow-2xl"
            >
                {/* Header */}
                <div className="bg-red-600 p-4 border-b-4 border-red-800 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white tracking-wider">TRAINER CARD</h2>
                    <div className="h-4 w-4 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.8)]"></div>
                </div>

                {/* Content */}
                <div className="p-4 md:p-8 bg-slate-900 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Profile Section */}
                    <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center border-4 border-slate-500 overflow-hidden relative">
                            <svg className="w-20 h-20 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-white">TRAINER</h3>
                            <p className="text-slate-400 text-sm">ID: {Math.floor(Math.random() * 90000) + 10000}</p>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-slate-900 p-3 rounded border border-slate-700 text-center">
                                <p className="text-xs text-slate-500 uppercase">Daily Streak</p>
                                <p className="text-2xl font-mono text-yellow-400">{maxDailyStreak}</p>
                            </div>
                            <div className="bg-slate-900 p-3 rounded border border-slate-700 text-center">
                                <p className="text-xs text-slate-500 uppercase">Active Wins</p>
                                <p className="text-2xl font-mono text-green-400">{totalWins}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="space-y-6">

                        {/* Silhouette Stats */}
                        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <svg className="w-24 h-24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
                                </svg>
                            </div>
                            <h4 className="text-green-400 font-bold mb-4 border-b border-green-500/30 pb-2">SILHOUETTE MODE</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-green-500/70 uppercase">Current Streak</p>
                                    <p className="text-3xl font-mono text-white">{silhouetteStats?.currentStreak || 0}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-green-500/70 uppercase">Best Streak</p>
                                    <p className="text-3xl font-mono text-yellow-400">{silhouetteStats?.bestStreak || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Trivia Stats */}
                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <svg className="w-24 h-24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                                </svg>
                            </div>
                            <h4 className="text-blue-400 font-bold mb-4 border-b border-blue-500/30 pb-2">TRIVIA MODE</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-blue-500/70 uppercase">Current Streak</p>
                                    <p className="text-3xl font-mono text-white">{triviaStats?.currentStreak || 0}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-500/70 uppercase">Best Streak</p>
                                    <p className="text-3xl font-mono text-yellow-400">{triviaStats?.bestStreak || 0}</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </motion.div>
        </div>
    );
}
