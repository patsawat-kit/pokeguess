"use client";

import { motion } from "framer-motion";

export default function Leaderboard() {
    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 rounded-xl overflow-hidden border-4 border-slate-600 shadow-2xl"
            >
                <div className="bg-yellow-500 p-4 border-b-4 border-yellow-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-wider flex items-center gap-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        LEADERBOARD
                    </h2>
                </div>

                <div className="p-12 text-center">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-2xl text-white font-bold mb-2">COMING SOON</h3>
                    <p className="text-slate-400">Global rankings are being calculated...</p>
                </div>
            </motion.div>
        </div>
    );
}
