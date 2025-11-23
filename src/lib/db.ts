import { Pool, neon } from '@neondatabase/serverless';

// Pool for parameterized queries
// Pool for parameterized queries
const pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : new Proxy({} as Pool, {
        get: () => { throw new Error('Database connection not initialized. DATABASE_URL environment variable is missing.'); }
    });

// Neon function for tagged template queries
// Neon function for tagged template queries
const sql: any = process.env.DATABASE_URL
    ? neon(process.env.DATABASE_URL)
    : ((...args: any[]) => { throw new Error('Database connection not initialized. DATABASE_URL environment variable is missing.'); });

/**
 * Execute a SQL query with parameters
 * @param queryText SQL query string (use $1, $2 for parameters)
 * @param params Array of parameter values
 * @returns Query results
 */
export async function query<T = any>(
    queryText: string,
    params: any[] = []
): Promise<T[]> {
    try {
        const result = await pool.query(queryText, params);
        return result.rows as T[];
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

/**
 * Execute a single-row query (e.g., INSERT RETURNING, SELECT with LIMIT 1)
 */
export async function queryOne<T = any>(
    queryText: string,
    params: any[] = []
): Promise<T | null> {
    const result = await pool.query(queryText, params);
    return (result.rows[0] as T) || null;
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
    const queryText = `
    INSERT INTO gamestats (user_id, mode, current_streak, best_streak, last_played)
    VALUES ($1, $2, $3, $4, CURRENT_DATE)
    ON CONFLICT (user_id, mode)
    DO UPDATE SET
      current_streak = $3,
      best_streak = GREATEST(gamestats.best_streak, $4),
      last_played = CURRENT_DATE
    RETURNING *
  `;
    return queryOne(queryText, [userId, mode, currentStreak, bestStreak]);
}

export { sql, pool };
