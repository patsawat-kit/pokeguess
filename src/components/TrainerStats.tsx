
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useGameScore } from "@/contexts/GameScoreContext";

interface GameStat {
    mode: string;
    current_streak: number;
    best_streak: number;
    last_played: string;
}

interface User {
    id: string;
    username: string;
    email: string;
    trainer_id: number;
    created_at: string;
}

interface AuthResponse {
    success: boolean;
    user?: User;
    stats?: GameStat[];
}

export default function TrainerStats() {
    // Use GameScore Context for all stats management
    const { stats, isAuthenticated, user, logout } = useGameScore();

    // Get stats for specific modes directly from context object
    const classicStats = stats['classic'] || { currentStreak: 0, bestStreak: 0 };
    const triviaStats = stats['trivia'] || { currentStreak: 0, bestStreak: 0 };

    // Calculate totals
    const allStats = Object.values(stats);
    const totalCurrentStreak = allStats.reduce((sum, s) => sum + s.currentStreak, 0);
    const totalBestStreak = Math.max(...allStats.map((s) => s.bestStreak), 0);




    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden border-4 border-slate-600 shadow-2xl"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 border-b-4 border-red-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wider flex items-center gap-2">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78-.19 1.621.166 2.334.357.713.959 1.266 1.692 1.556.733.29 1.545.315 2.293.074.747-.24 1.4-.73 1.84-1.38l.818-2.552c.25-.78.19-1.621-.166-2.334-.357-.713-.959-1.266-1.692-1.556-.733-.29-1.545-.315-2.293-.074-.747.24-1.4.73-1.84 1.38z" />
                        </svg>
                        TRAINER CARD
                    </h2>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                        {isAuthenticated ? (
                            <div className="px-3 py-1 bg-green-500 rounded-full text-xs font-bold text-white flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                                ONLINE
                            </div>
                        ) : (
                            <div className="px-3 py-1 bg-slate-600 rounded-full text-xs font-bold text-white flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                                GUEST
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 md:p-8 bg-slate-900">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Profile Section */}
                        <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-slate-800/50 rounded-xl border-2 border-slate-700 shadow-lg">
                            <div className="w-32 h-32 bg-gradient-to-br from-slate-700 to-slate-600 rounded-full flex items-center justify-center border-4 border-slate-500 overflow-hidden relative shadow-xl">
                                <svg className="w-20 h-20 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>

                            <div className="text-center w-full">
                                <h3 className="text-2xl font-bold text-white uppercase tracking-wide">
                                    {isAuthenticated ? user!.username : "Trainer"}
                                </h3>
                                <p className="text-slate-400 text-sm font-mono mt-1">
                                    {isAuthenticated ? `#${user!.trainer_id} ` : "#GUEST"}
                                </p>
                                {!isAuthenticated && (
                                    <p className="text-yellow-400 text-xs mt-2 font-semibold">
                                        ⚠️ Stats saved locally only
                                    </p>
                                )}
                            </div>

                            {/* Quick Stats - REMOVED as per request */}
                            {/* <div className="w-full grid grid-cols-2 gap-4 mt-4">
                                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center shadow-inner">
                                    <p className="text-xs text-slate-400 uppercase font-semibold">Total Streak</p>
                                    <p className="text-2xl font-mono text-green-400 font-bold">
                                        {totalCurrentStreak}
                                    </p>
                                </div>
                                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center shadow-inner">
                                    <p className="text-xs text-slate-400 uppercase font-semibold">Best Ever</p>
                                    <p className="text-2xl font-mono text-yellow-400 font-bold">{totalBestStreak}</p>
                                </div>
                            </div> */}

                            {/* Auth Actions */}
                            {!isAuthenticated ? (
                                <Link href="/login" className="w-full mt-4">
                                    <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                            />
                                        </svg>
                                        Login to Save Progress
                                    </button>
                                </Link>
                            ) : (
                                <button
                                    onClick={() => logout()}
                                    className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-2 px-6 rounded-lg transition-all duration-200 border border-slate-600 hover:border-slate-500 flex items-center justify-center gap-2 text-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            )}
                        </div>

                        {/* Stats Grid */}
                        <div className="space-y-6">
                            {/* Classic Mode Stats */}
                            <div className="bg-green-900/20 border-2 border-green-500/30 rounded-xl p-4 relative overflow-hidden shadow-lg hover:shadow-green-500/20 transition-shadow">
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <svg className="w-24 h-24" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
                                    </svg>
                                </div>
                                <h4 className="text-green-400 font-bold mb-4 border-b border-green-500/30 pb-2 uppercase tracking-wide">
                                    Classic Mode
                                </h4>
                                <div className="grid grid-cols-2 gap-4 relative z-10">
                                    <div>
                                        <p className="text-xs text-green-400/70 uppercase font-semibold">
                                            Current Streak
                                        </p>
                                        <p className="text-4xl font-mono text-white font-bold">
                                            {classicStats.currentStreak}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-green-400/70 uppercase font-semibold">Best Streak</p>
                                        <p className="text-4xl font-mono text-yellow-400 font-bold">
                                            {classicStats.bestStreak}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Trivia Mode Stats */}
                            <div className="bg-blue-900/20 border-2 border-blue-500/30 rounded-xl p-4 relative overflow-hidden shadow-lg hover:shadow-blue-500/20 transition-shadow">
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <svg className="w-24 h-24" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                                    </svg>
                                </div>
                                <h4 className="text-blue-400 font-bold mb-4 border-b border-blue-500/30 pb-2 uppercase tracking-wide">
                                    Trivia Mode
                                </h4>
                                <div className="grid grid-cols-2 gap-4 relative z-10">
                                    <div>
                                        <p className="text-xs text-blue-400/70 uppercase font-semibold">
                                            Current Streak
                                        </p>
                                        <p className="text-4xl font-mono text-white font-bold">
                                            {triviaStats.currentStreak}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-400/70 uppercase font-semibold">Best Streak</p>
                                        <p className="text-4xl font-mono text-yellow-400 font-bold">
                                            {triviaStats.bestStreak}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Info Footer */}
                    {isAuthenticated && user && (
                        <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700 text-center">
                            <p className="text-xs text-slate-400">
                                Member since{" "}
                                <span className="text-slate-300 font-semibold">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </span>
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
