/**
 * Unified Stats Manager
 * Handles local stats using localStorage
 */

import { getStats as getLocalStats, updateStreak as updateLocalStreak, ModeStats } from './statsManager';

/**
 * Get stats for a mode
 * @param modeId - 'silhouette' or 'trivia'
 */
export async function getUnifiedStats(modeId: string): Promise<ModeStats> {
    return getLocalStats(modeId);
}

/**
 * Update stats after a game
 * @param modeId - 'silhouette' or 'trivia'
 * @param isWin - Whether the user won
 */
export async function updateUnifiedStats(
    modeId: string,
    isWin: boolean
): Promise<ModeStats> {
    return updateLocalStreak(modeId, isWin);
}

/**
 * Get all stats for display (both modes)
 */
export async function getAllUnifiedStats(): Promise<Record<string, ModeStats>> {
    const modes = ['silhouette', 'trivia'];
    const stats: Record<string, ModeStats> = {};

    for (const mode of modes) {
        stats[mode] = await getUnifiedStats(mode);
    }

    return stats;
}
