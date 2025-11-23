# NeonDB Setup Guide

This guide will help you set up NeonDB (PostgreSQL) for the Who's That Pokémon game.

## Prerequisites

- Neon account (sign up at https://neon.tech)
- Node.js and npm installed
- Next.js project set up

## Step 1: Install Dependencies

The `@neondatabase/serverless` package has already been installed:

```bash
npm install @neondatabase/serverless
```

## Step 2: Create a Neon Project

1. Go to https://neon.tech and sign in
2. Click "Create Project"
3. Choose a project name (e.g., "whos-that-pokemon-db")
4. Select a region close to your users
5. Click "Create Project"

## Step 3: Get Your Database Connection String

1. In your Neon dashboard, go to your project
2. Click on "Connection Details" or "Connect"
3. Copy the connection string (it looks like this):
   ```
   postgresql://[user]:[password]@[hostname]/[database]?sslmode=require
   ```

## Step 4: Configure Environment Variables

Add the connection string to your `.env.local` file:

```env
# NeonDB Connection String
DATABASE_URL=postgresql://[user]:[password]@[hostname]/[database]?sslmode=require
```

> [!IMPORTANT]
> Replace the entire string with your actual connection string from Neon. Never commit this file to Git.

## Step 5: Create Database Schema

1. In your Neon dashboard, click on "SQL Editor"
2. Copy and paste the following SQL commands:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    trainer_id INTEGER UNIQUE NOT NULL CHECK (trainer_id >= 100000 AND trainer_id <= 999999),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes on username and email for faster lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_trainer_id ON users(trainer_id);

-- Gamestats table
CREATE TABLE gamestats (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode VARCHAR(50) NOT NULL,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    last_played DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_mode UNIQUE (user_id, mode)
);

-- Create index on user_id for faster joins
CREATE INDEX idx_gamestats_user_id ON gamestats(user_id);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gamestats_updated_at 
    BEFORE UPDATE ON gamestats 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

3. Click "Run" to execute the SQL
4. Verify that the tables have been created (you should see `users` and `gamestats` in the Tables section)

## Step 6: Test Database Connection

Create a test API route to verify the connection:

**Create file:** `src/app/api/test-db/route.ts`

```typescript
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await query('SELECT NOW() as current_time');
    return NextResponse.json({ 
      success: true, 
      message: 'Database connected successfully!',
      data: result 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}
```

Visit `http://localhost:3000/api/test-db` in your browser. If you see a success message with the current time, your database is connected!

## Database Helper Functions

The `src/lib/db.ts` file provides the following functions:

### `query<T>(query: string, params: any[]): Promise<T[]>`
Execute any SQL query with parameters.

**Example:**
```typescript
import { query } from '@/lib/db';

const users = await query(
  'SELECT * FROM users WHERE username = $1',
  ['ash_ketchum']
);
```

### `queryOne<T>(query: string, params: any[]): Promise<T | null>`
Execute a query that returns a single row.

**Example:**
```typescript
import { queryOne } from '@/lib/db';

const user = await queryOne(
  'SELECT * FROM users WHERE id = $1',
  ['uuid-here']
);
```

### `upsertGameStats(userId, mode, currentStreak, bestStreak)`
Update or insert game statistics for a user.

**Example:**
```typescript
import { upsertGameStats } from '@/lib/db';

await upsertGameStats(
  'user-uuid',
  'classic',
  5,
  10
);
```

## Schema Details

### Users Table
- `id`: UUID (auto-generated)
- `username`: Unique username
- `email`: Unique email address
- `password_hash`: Hashed password (use bcrypt or argon2)
- `trainer_id`: 6-digit unique trainer ID (100000-999999)
- `created_at`: Timestamp of account creation

### Gamestats Table
- `id`: Auto-incrementing ID
- `user_id`: Foreign key to users table
- `mode`: Game mode (classic, trivia, etc.)
- `current_streak`: Current winning streak
- `best_streak`: Best winning streak ever
- `last_played`: Date of last game
- `created_at`: Timestamp of first play
- `updated_at`: Timestamp of last update

### Unique Constraint
The `(user_id, mode)` combination is unique, allowing upsert operations.

## Security Notes

> [!CAUTION]
> - Never store plain text passwords. Always hash them with bcrypt or argon2.
> - Keep your `DATABASE_URL` secret. Never commit `.env.local` to Git.
> - Use parameterized queries to prevent SQL injection (which is already done in `db.ts`).

## Next Steps

1. Implement user registration API route
2. Implement user authentication API route
3. Implement game stats API routes
4. Integrate with your game components

## Troubleshooting

**Connection Error:** Make sure your `DATABASE_URL` is correct and your Neon project is running.

**UUID Extension Error:** Some Neon databases already have the uuid-ossp extension. You can safely ignore the error if it says the extension already exists.

**Table Already Exists:** If you're re-running the schema, you may need to drop the existing tables first or modify the schema to use `CREATE TABLE IF NOT EXISTS`.
