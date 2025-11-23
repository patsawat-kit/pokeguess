# Supabase Setup Guide

This guide will walk you through setting up Supabase for authentication and online features.

## Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: whos-that-pokemon (or your preferred name)
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (~2 minutes)

## Step 2: Get API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

3. Create a `.env.local` file in your project root:
   ```bash
   cp .env.local.example .env.local
   ```

4. Update `.env.local` with your values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 3: Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the following SQL (run each section separately):

### Create Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game statistics table
CREATE TABLE public.game_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  mode_id TEXT NOT NULL,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  daily_streak INTEGER DEFAULT 0,
  last_played_date DATE,
  total_games INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, mode_id)
);

-- Leaderboard entries (denormalized for performance)
CREATE TABLE public.leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  mode_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, mode_id)
);

-- Create indexes for performance
CREATE INDEX idx_game_stats_user_mode ON public.game_stats(user_id, mode_id);
CREATE INDEX idx_leaderboard_mode_score ON public.leaderboard_entries(mode_id, score DESC);
CREATE INDEX idx_profiles_username ON public.profiles(username);
```

### Set Up Row Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Game stats policies
CREATE POLICY "Users can view own stats"
  ON public.game_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON public.game_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON public.game_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Leaderboard policies (read-only for users)
CREATE POLICY "Leaderboard is viewable by everyone"
  ON public.leaderboard_entries FOR SELECT
  USING (true);
```

### Create Functions and Triggers

```sql
-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_stats_updated_at
  BEFORE UPDATE ON public.game_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-update leaderboard when stats change
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.leaderboard_entries (user_id, username, mode_id, score)
  SELECT 
    NEW.user_id,
    p.username,
    NEW.mode_id,
    NEW.best_streak
  FROM public.profiles p
  WHERE p.id = NEW.user_id
  ON CONFLICT (user_id, mode_id) 
  DO UPDATE SET 
    score = EXCLUDED.score,
    username = EXCLUDED.username,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_game_stats_change
  AFTER INSERT OR UPDATE ON public.game_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_leaderboard();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'trainer_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Step 4: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable the providers you want:
   - **Email**: Already enabled by default
   - **Google**: Optional (requires OAuth setup)
   - **GitHub**: Optional (requires OAuth setup)

### Email Authentication Settings

1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation email if desired
3. Go to **Authentication** → **URL Configuration**
4. Set **Site URL** to your production domain (e.g., `https://your-domain.com`)
5. Add **Redirect URLs**:
   - `http://localhost:3000/**` (for development)
   - `https://your-domain.com/**` (for production)

## Step 5: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. The app should now connect to Supabase
3. Try creating an account to verify everything works

## Step 6: Deploy to Vercel (Production)

1. In Vercel dashboard, go to your project settings
2. Go to **Environment Variables**
3. Add the following variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

4. Redeploy your application

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` file has the correct values
- Make sure you're using the **anon/public** key, not the service role key
- Restart your dev server after changing env variables

### "Row Level Security policy violation"
- Verify all RLS policies were created successfully
- Check that the user is authenticated when trying to access protected data

### Profile not created on signup
- Check that the `handle_new_user` trigger is active
- Verify the trigger function has no errors in the SQL Editor

### Leaderboard not updating
- Verify the `update_leaderboard` trigger is active
- Check that game stats are being inserted/updated correctly

## Security Notes

- ✅ Never commit `.env.local` to git
- ✅ Use Row Level Security for all tables
- ✅ The anon key is safe to expose in client-side code
- ✅ Never expose the service role key
- ✅ Always validate user input on the server side

## Next Steps

Once setup is complete, you can:
- Create an account and test authentication
- Play games and verify stats are saved to the cloud
- Check the leaderboard updates in real-time
- Test guest mode and account migration

For more information, see the [Supabase Documentation](https://supabase.com/docs).
