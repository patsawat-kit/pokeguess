"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error || "Reset failed");

            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center text-white">
                <h2 className="text-xl font-bold mb-4">Invalid Link</h2>
                <p className="mb-4">This password reset link is invalid or missing a token.</p>
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold">
                    Return to Login
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center text-white">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">PASSWORD UPDATED!</h2>
                <p className="text-slate-300 mb-6">Your access code has been successfully reset.</p>
                <p className="text-sm text-slate-500 animate-pulse">Redirecting to login...</p>
            </div>
        );
    }

    return (
        <>
            <div className="mb-8 text-center">
                <h2 className="text-xl font-bold text-white mb-2">NEW PASSWORD</h2>
                <p className="text-slate-400 text-sm">Enter your new secure access code.</p>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm font-mono flex items-start gap-2"
                    >
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5 flex-grow">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                        New Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-yellow-400 focus:outline-none focus:bg-slate-700 transition-all min-h-[44px]"
                        placeholder="••••••••"
                        required
                        minLength={6}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-yellow-400 focus:outline-none focus:bg-slate-700 transition-all min-h-[44px]"
                        placeholder="••••••••"
                        required
                        minLength={6}
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-[0_4px_0_rgb(29,78,216)] active:shadow-[0_2px_0_rgb(29,78,216)] active:translate-y-[2px] transition-all uppercase tracking-widest text-lg flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                UPDATING...
                            </>
                        ) : (
                            "RESET PASSWORD"
                        )}
                    </button>
                </div>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),transparent_70%)]"></div>
                <div className="grid grid-cols-[repeat(20,1fr)] gap-1 opacity-30 h-full w-full">
                    {Array.from({ length: 400 }).map((_, i) => (
                        <div key={i} className="bg-slate-800/50 rounded-sm"></div>
                    ))}
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-red-600 rounded-3xl shadow-2xl overflow-hidden flex flex-col border-8 border-red-800 relative z-10"
            >
                {/* Header */}
                <div className="bg-red-600 p-6 flex justify-between items-center shadow-md z-10 relative">
                    <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 bg-blue-400 rounded-full border-4 border-white shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse">
                            <div className="w-3 h-3 bg-white rounded-full absolute top-3 left-3 opacity-60"></div>
                        </div>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 rounded-full bg-red-800"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                    </div>
                </div>

                {/* Screen Area */}
                <div className="flex-1 bg-slate-800 m-4 mt-0 rounded-xl border-4 border-slate-900 shadow-inner overflow-hidden relative min-h-[400px]">
                    {/* Scanlines */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,3px_100%]"></div>

                    <div className="relative z-10 p-6 flex flex-col h-full justify-center">
                        <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
                            <ResetPasswordContent />
                        </Suspense>
                    </div>
                </div>

                {/* Footer Decoration */}
                <div className="bg-red-600 p-4 flex justify-center gap-6 relative z-10">
                    <div className="w-16 h-2 bg-red-800 rounded-full"></div>
                    <div className="w-2 h-2 bg-red-800 rounded-full"></div>
                    <div className="w-2 h-2 bg-red-800 rounded-full"></div>
                    <div className="w-16 h-2 bg-red-800 rounded-full"></div>
                </div>
            </motion.div>
        </div>
    );
}
