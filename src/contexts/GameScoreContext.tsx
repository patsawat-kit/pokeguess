"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Types
interface GameStats {
    [mode: string]: {
        currentStreak: number;
        bestStreak: number;
    };
}

interface GameScoreContextType {
    stats: GameStats;
    updateStats: (mode: string, currentStreak: number, bestStreak: number) => void;
    resetStreak: (mode: string) => void;
    setAllStats: (stats: GameStats) => void;
    isAuthenticated: boolean;
    setIsAuthenticated: (value: boolean) => void;
    user: User | null;
    fetchUser: () => Promise<void>;
    logout: () => Promise<void>;
}

interface User {
    id: string;
    username: string;
    email: string;
    trainer_id: number;
    created_at: string;
}

// Create Context
const GameScoreContext = createContext<GameScoreContextType | undefined>(undefined);

// localStorage key
const GUEST_STATS_KEY = "guest_pokemon_stats";

// Provider Component
export function GameScoreProvider({ children }: { children: ReactNode }) {
    const [stats, setStats] = useState<GameStats>({});
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    // Initialize from localStorage on mount
    useEffect(() => {
        loadStatsFromStorage();
        fetchUser(); // Check for auth session on mount
    }, []);

    // Fetch authenticated user
    const fetchUser = async () => {
        try {
            const response = await fetch("/api/auth/me");
            const data = await response.json();

            if (data.success && data.user) {
                setUser(data.user);
                setIsAuthenticated(true);

                // Hydrate stats if provided
                if (data.stats) {
                    const hydratedStats: any = {};
                    data.stats.forEach((stat: any) => {
                        // Map legacy 'silhouette' mode to 'classic'
                        const modeName = stat.mode === 'silhouette' ? 'classic' : stat.mode;

                        // If we already have classic stats (e.g. from merging), keep the better ones
                        if (modeName === 'classic' && hydratedStats['classic']) {
                            hydratedStats['classic'].currentStreak = Math.max(hydratedStats['classic'].currentStreak, stat.current_streak);
                            hydratedStats['classic'].bestStreak = Math.max(hydratedStats['classic'].bestStreak, stat.best_streak);
                        } else {
                            hydratedStats[modeName] = {
                                currentStreak: stat.current_streak,
                                bestStreak: stat.best_streak
                            };
                        }
                    });
                    // Ensure default modes exist
                    if (!hydratedStats['classic']) hydratedStats['classic'] = { currentStreak: 0, bestStreak: 0 };
                    if (!hydratedStats['trivia']) hydratedStats['trivia'] = { currentStreak: 0, bestStreak: 0 };

                    setStats(hydratedStats);
                }
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            setIsAuthenticated(false);
            setUser(null);
            window.location.reload();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // Load stats from localStorage
    const loadStatsFromStorage = () => {
        try {
            const stored = localStorage.getItem(GUEST_STATS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setStats(parsed);
            } else {
                // Initialize with default modes
                const defaultStats: GameStats = {
                    classic: { currentStreak: 0, bestStreak: 0 },
                    trivia: { currentStreak: 0, bestStreak: 0 },
                };
                setStats(defaultStats);
                localStorage.setItem(GUEST_STATS_KEY, JSON.stringify(defaultStats));
            }
        } catch (error) {
            console.error("Failed to load stats from localStorage:", error);
            setStats({
                classic: { currentStreak: 0, bestStreak: 0 },
                trivia: { currentStreak: 0, bestStreak: 0 },
            });
        }
    };

    // Save stats to localStorage
    const saveStatsToStorage = (newStats: GameStats) => {
        try {
            localStorage.setItem(GUEST_STATS_KEY, JSON.stringify(newStats));
        } catch (error) {
            console.error("Failed to save stats to localStorage:", error);
        }
    };

    // Sync stats to server for authenticated users
    const syncStatsToServer = async (mode: string, currentStreak: number, bestStreak: number) => {
        try {
            await fetch('/api/game/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode, currentStreak, bestStreak }),
            });
        } catch (error) {
            console.error("Failed to sync stats to server:", error);
        }
    };

    // Update stats for a specific game mode
    const updateStats = (mode: string, currentStreak: number, bestStreak: number) => {
        setStats((prevStats) => {
            const newStats = {
                ...prevStats,
                [mode]: {
                    currentStreak,
                    bestStreak: Math.max(bestStreak, prevStats[mode]?.bestStreak || 0),
                },
            };

            if (!isAuthenticated) {
                saveStatsToStorage(newStats);
            } else {
                // Sync to server if authenticated
                syncStatsToServer(mode, currentStreak, newStats[mode].bestStreak);
            }

            return newStats;
        });
    };

    // Reset streak for a specific mode (on wrong answer)
    const resetStreak = (mode: string) => {
        setStats((prevStats) => {
            const newStats = {
                ...prevStats,
                [mode]: {
                    ...prevStats[mode],
                    currentStreak: 0,
                },
            };

            if (!isAuthenticated) {
                saveStatsToStorage(newStats);
            } else {
                // Sync to server if authenticated
                syncStatsToServer(mode, 0, newStats[mode].bestStreak);
            }

            return newStats;
        });
    };

    // Set all stats (e.g. from database hydration)
    const setAllStats = (newStats: GameStats) => {
        setStats(newStats);
    };

    const value: GameScoreContextType = {
        stats,
        updateStats,
        resetStreak,
        setAllStats,
        isAuthenticated,
        setIsAuthenticated,
        user,
        fetchUser,
        logout,
    };

    return <GameScoreContext.Provider value={value}>{children}</GameScoreContext.Provider>;
}

// Custom hook for easy consumption
export function useGameScore() {
    const context = useContext(GameScoreContext);
    if (context === undefined) {
        throw new Error("useGameScore must be used within a GameScoreProvider");
    }
    return context;
}

// Helper function for game components
export function useGameMode(mode: string) {
    const { stats, updateStats, resetStreak } = useGameScore();

    const modeStats = stats[mode] || { currentStreak: 0, bestStreak: 0 };

    const handleWin = () => {
        const newStreak = modeStats.currentStreak + 1;
        const newBest = Math.max(newStreak, modeStats.bestStreak);
        updateStats(mode, newStreak, newBest);
    };

    const handleLoss = () => {
        resetStreak(mode);
    };

    return {
        currentStreak: modeStats.currentStreak,
        bestStreak: modeStats.bestStreak,
        handleWin,
        handleLoss,
    };
}
