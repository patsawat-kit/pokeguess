"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useGameScore } from "@/contexts/GameScoreContext";

export default function AuthModal() {
    const router = useRouter();
    const { fetchUser } = useGameScore();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isForgotPassword, setIsForgotPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        identifier: "" // For login (username or email)
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(""); // Clear error on input
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (isForgotPassword) {
                // Forgot Password Logic
                const res = await fetch("/api/auth/forgot-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: formData.email })
                });

                const data = await res.json();
                if (!data.success) throw new Error(data.error || "Request failed");

                // Show success message (reusing error state for simplicity, or add new state)
                setError("✅ Check your server console for the reset link!");
                // In a real app, we'd show a success UI, but here we just want to notify the user
            } else if (isLogin) {
                // Login Logic
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        identifier: formData.identifier,
                        password: formData.password
                    })
                });

                const data = await res.json();
                if (!data.success) throw new Error(data.error || "Login failed");

                // Redirect to home on success
                await fetchUser(); // Update context immediately
                router.push("/");
                router.refresh();
            } else {
                // Register Logic
                if (formData.password !== formData.confirmPassword) {
                    throw new Error("Passwords do not match");
                }

                // Read guest stats from localStorage
                const GUEST_STATS_KEY = "guest_pokemon_stats";
                let guestStats = null;
                try {
                    const stored = localStorage.getItem(GUEST_STATS_KEY);
                    if (stored) {
                        guestStats = JSON.parse(stored);
                    }
                } catch (e) {
                    console.error("Error reading guest stats:", e);
                }

                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: formData.username,
                        email: formData.email,
                        password: formData.password,
                        guestStats // Send guest stats for migration
                    })
                });

                const data = await res.json();
                if (!data.success) throw new Error(data.error || "Registration failed");

                // Clear guest stats from localStorage on success
                localStorage.removeItem(GUEST_STATS_KEY);

                // Redirect to home on success
                await fetchUser(); // Update context immediately
                router.push("/");
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-0 md:p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full md:h-auto md:max-w-md bg-red-600 md:rounded-3xl shadow-2xl overflow-hidden flex flex-col border-0 md:border-8 border-red-800 relative"
            >
                {/* Rotom Phone / Pokedex Header */}
                <div className="bg-red-600 p-6 pt-8 md:pt-6 flex justify-between items-center shadow-md z-10 relative">
                    <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-400 rounded-full border-4 border-white shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse">
                            <div className="w-3 h-3 bg-white rounded-full absolute top-3 left-3 opacity-60"></div>
                        </div>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 rounded-full bg-red-800"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                    </div>

                    {/* Close Button (Mobile only mostly, but good for UX) */}
                    <Link href="/" className="text-white/80 hover:text-white transition-colors">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </Link>
                </div>

                {/* Screen Area */}
                <div className="flex-1 bg-slate-800 md:m-4 md:mt-0 md:rounded-xl border-t-4 md:border-4 border-slate-900 shadow-inner overflow-y-auto relative">
                    {/* Scanlines effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,3px_100%]"></div>

                    <div className="relative z-10 p-6 flex flex-col min-h-full">

                        {/* Tabs */}
                        {!isForgotPassword && (
                            <div className="flex bg-slate-900/50 p-1 rounded-xl mb-8 border border-slate-700">
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className={`flex-1 py-3 rounded-lg font-bold text-sm tracking-wider transition-all duration-300 ${isLogin
                                        ? "bg-yellow-400 text-slate-900 shadow-[0_0_10px_rgba(250,204,21,0.4)]"
                                        : "text-slate-400 hover:text-white"
                                        }`}
                                >
                                    LOGIN
                                </button>
                                <button
                                    onClick={() => setIsLogin(false)}
                                    className={`flex-1 py-3 rounded-lg font-bold text-sm tracking-wider transition-all duration-300 ${!isLogin
                                        ? "bg-yellow-400 text-slate-900 shadow-[0_0_10px_rgba(250,204,21,0.4)]"
                                        : "text-slate-400 hover:text-white"
                                        }`}
                                >
                                    REGISTER
                                </button>
                            </div>
                        )}

                        {/* Forgot Password Header */}
                        {isForgotPassword && (
                            <div className="mb-8 text-center">
                                <h2 className="text-xl font-bold text-white mb-2">RESET PASSWORD</h2>
                                <p className="text-slate-400 text-sm">Enter your email to receive a reset link.</p>
                            </div>
                        )}

                        {/* Error Alert */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={`border px-4 py-3 rounded-lg mb-6 text-sm font-mono flex items-start gap-2 ${error.startsWith("✅")
                                        ? "bg-green-500/20 border-green-500 text-green-200"
                                        : "bg-red-500/20 border-red-500 text-red-200"
                                        }`}
                                >
                                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {error.startsWith("✅") ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        )}
                                    </svg>
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5 flex-grow">
                            <AnimatePresence mode="wait">
                                {isForgotPassword ? (
                                    <motion.div
                                        key="forgot-password"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-5"
                                    >
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-yellow-400 focus:outline-none focus:bg-slate-700 transition-all min-h-[44px]"
                                                placeholder="red@pallet.town"
                                                required
                                            />
                                        </div>
                                    </motion.div>
                                ) : isLogin ? (
                                    <motion.div
                                        key="login"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-5"
                                    >
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                                                Trainer ID (Username or Email)
                                            </label>
                                            <input
                                                type="text"
                                                name="identifier"
                                                value={formData.identifier}
                                                onChange={handleInputChange}
                                                className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-yellow-400 focus:outline-none focus:bg-slate-700 transition-all min-h-[44px]"
                                                placeholder="AshKetchum"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                                                Access Code (Password)
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-yellow-400 focus:outline-none focus:bg-slate-700 transition-all min-h-[44px]"
                                                placeholder="••••••••"
                                                required
                                            />
                                            <div className="flex justify-end mt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsForgotPassword(true);
                                                        setError("");
                                                    }}
                                                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                                                >
                                                    Forgot Password?
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="register"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-5"
                                    >
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                                                Trainer Name
                                            </label>
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-yellow-400 focus:outline-none focus:bg-slate-700 transition-all min-h-[44px]"
                                                placeholder="Red"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-yellow-400 focus:outline-none focus:bg-slate-700 transition-all min-h-[44px]"
                                                placeholder="red@pallet.town"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                                                    Password
                                                </label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-yellow-400 focus:outline-none focus:bg-slate-700 transition-all min-h-[44px]"
                                                    placeholder="••••••"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                                                    Confirm
                                                </label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-yellow-400 focus:outline-none focus:bg-slate-700 transition-all min-h-[44px]"
                                                    placeholder="••••••"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="pt-4 space-y-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-[0_4px_0_rgb(29,78,216)] active:shadow-[0_2px_0_rgb(29,78,216)] active:translate-y-[2px] transition-all uppercase tracking-widest text-lg flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            PROCESSING...
                                        </>
                                    ) : (
                                        isForgotPassword ? "SEND RESET LINK" : (isLogin ? "LOG IN" : "REGISTER TRAINER")
                                    )}
                                </button>

                                {isForgotPassword && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsForgotPassword(false);
                                            setError("");
                                        }}
                                        className="w-full text-slate-400 hover:text-white text-sm font-bold transition-colors"
                                    >
                                        CANCEL
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer Decoration */}
                <div className="bg-red-600 p-4 md:p-3 flex justify-center gap-6 relative z-10">
                    <div className="w-16 h-2 bg-red-800 rounded-full"></div>
                    <div className="w-2 h-2 bg-red-800 rounded-full"></div>
                    <div className="w-2 h-2 bg-red-800 rounded-full"></div>
                    <div className="w-16 h-2 bg-red-800 rounded-full"></div>
                </div>
            </motion.div>
        </div>
    );
}
