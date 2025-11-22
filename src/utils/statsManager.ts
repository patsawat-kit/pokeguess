export interface ModeStats {
    currentStreak: number;
    bestStreak: number;
    dailyStreak: number;
    lastPlayedDate: string; // YYYY-MM-DD
}

const STORAGE_KEY_PREFIX = 'wtp_stats_';

const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
};

const getYesterdayDate = (): string => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
};

export const getStats = (modeId: string): ModeStats => {
    if (typeof window === 'undefined') {
        return { currentStreak: 0, bestStreak: 0, dailyStreak: 0, lastPlayedDate: '' };
    }

    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${modeId}`);
    if (stored) {
        return JSON.parse(stored);
    }

    return {
        currentStreak: 0,
        bestStreak: 0,
        dailyStreak: 0,
        lastPlayedDate: '',
    };
};

const saveStats = (modeId: string, stats: ModeStats) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${modeId}`, JSON.stringify(stats));
    }
};

export const checkDailyStreak = (modeId: string): ModeStats => {
    const stats = getStats(modeId);
    const today = getTodayDate();
    const yesterday = getYesterdayDate();

    // If already played today, do nothing
    if (stats.lastPlayedDate === today) {
        return stats;
    }

    // If played yesterday, increment daily streak
    if (stats.lastPlayedDate === yesterday) {
        stats.dailyStreak += 1;
    } else {
        // If missed a day (or first time), reset daily streak to 1 (start of new streak)
        // However, usually daily streak increments only on completion of a task. 
        // The requirement says "If it's consecutive, increment... If skipped, reset".
        // We'll reset to 0 here if it's not consecutive, and let the updateStreak (win) or a separate "played" action increment it?
        // Actually, the prompt says "checkDailyStreak() that compares today's date with lastPlayedDate".
        // It implies this runs when the user *opens* the mode or *plays* a game.
        // Let's assume this is called when a game is *completed* or *started* for the day?
        // "If it's consecutive, increment... If a day was skipped, reset".

        // Let's interpret this as:
        // If lastPlayedDate == yesterday, we are continuing.
        // If lastPlayedDate < yesterday, we broke the streak.
        // We should probably only increment when they actually *play* (which might be this function call or updateStreak).
        // But the prompt says "checkDailyStreak... increment...".
        // Let's assume this is called to *update* the status based on the fact that they are here now.
        // But simply visiting shouldn't count? Usually it's "Daily Challenge".
        // For now, I will implement it such that it resets if broken, but increments ONLY if we consider this "playing".
        // The prompt says "If it's consecutive, increment".

        // Wait, if I play today, then play again today, it shouldn't increment twice.
        // So:
        // 1. If lastPlayed == today: return (already counted)
        // 2. If lastPlayed == yesterday: increment dailyStreak, set lastPlayed = today.
        // 3. Else (lastPlayed < yesterday): reset dailyStreak = 1, set lastPlayed = today.

        stats.dailyStreak = 1;
    }

    stats.lastPlayedDate = today;
    saveStats(modeId, stats);
    return stats;
};

export const updateStreak = (modeId: string, isWin: boolean): ModeStats => {
    const stats = getStats(modeId);

    // We also need to ensure daily streak logic is consistent. 
    // If we rely on checkDailyStreak to be called separately, we just handle win/loss here.
    // But often playing a game *is* the daily activity.
    // Let's assume checkDailyStreak handles the "Daily" part, and this handles the "Win Streak" part.

    if (isWin) {
        stats.currentStreak += 1;
        if (stats.currentStreak > stats.bestStreak) {
            stats.bestStreak = stats.currentStreak;
        }
    } else {
        stats.currentStreak = 0;
    }

    saveStats(modeId, stats);
    return stats;
};
