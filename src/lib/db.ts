import { neon } from '@neondatabase/serverless';

// Neon function for HTTP queries
const sql = process.env.DATABASE_URL
    ? neon(process.env.DATABASE_URL)
    : ((...args: any[]) => { throw new Error('Database connection not initialized. DATABASE_URL environment variable is missing.'); });

/**
 * Execute a SQL query using tagged template literal
 * Example: await query`SELECT * FROM users WHERE id = ${userId}`
 */
export async function query<T = any>(
    strings: TemplateStringsArray,
    ...values: any[]
): Promise<T[]> {
    try {
        const result = await sql(strings, ...values);
        return result as T[];
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

/**
 * Execute a single-row query using tagged template literal
 * Example: await queryOne`SELECT * FROM users WHERE id = ${userId}`
 */
export async function queryOne<T = any>(
    strings: TemplateStringsArray,
    ...values: any[]
): Promise<T | null> {
    const result = await query<T>(strings, ...values);
    return result[0] || null;
}

/**
 * Upsert game stats for a user
 */
export async function upsertGameStats(
    userId: string,
    mode: string,
    currentStreak: number,
    bestStreak: number
) {
    // Note: This needs to be converted to tagged template usage or use queryOne with template
    // Since we are inside db.ts, we can use sql directly or queryOne
    return queryOne`
    INSERT INTO gamestats (user_id, mode, current_streak, best_streak, last_played)
    VALUES (${userId}, ${mode}, ${currentStreak}, ${bestStreak}, CURRENT_DATE)
    ON CONFLICT (user_id, mode)
    DO UPDATE SET
      current_streak = ${currentStreak},
      best_streak = GREATEST(gamestats.best_streak, ${bestStreak}),
      last_played = CURRENT_DATE
    RETURNING *
  `;
}

export { sql };
