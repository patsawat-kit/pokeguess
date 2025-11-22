# Who's That Pokémon? 🎮

A nostalgic Pokémon guessing game inspired by the classic "Who's That Pokémon?" TV segment. Test your knowledge across all 9 generations with authentic music and sound effects!

![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

## ✨ Features

### 🎮 Game Modes
-  **Silhouette Mode** - Classic "Who's That Pokémon?" guessing game
-  **Trivia Mode** - Guess Pokémon from Pokédex descriptions with type hints
-  **Trainer Stats** - Track your progress and streaks across all modes

### 🎵 Audio & Visuals
-  **Authentic Music** - Classic Pokémon soundtrack (Pallet Town, Cinnabar Island, etc.)
-  **Sound Effects** - Pokémon cries and retro UI sounds
-  **Minimizable Audio Player** - Floating widget with full playback controls
-  **Retro Design** - Authentic Pokédex aesthetic with pixel font

### 📊 Stats & Progression
-  **Streak Tracking** - Keep track of your winning streaks per mode
-  **Daily Streak** - Maintain your daily play streak
-  **Trainer Card** - View your stats in a Pokédex-style interface

### 🎨 UI/UX
-  **All 9 Generations** - Choose from Gen 1-9 Pokémon
-  **Dark/Light Mode** - Toggle between themes
-  **Mobile Optimized** - Responsive design with hamburger menu
-  **Release Notes** - Kalos Pokédex-styled update notifications
-  **Accessible** - Full WCAG compliance with ARIA labels and keyboard navigation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd whos-that-pokemon

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Create production build
npm start        # Run production server
npm run lint     # Run ESLint
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page with view switching
│   └── globals.css         # Global styles
├── components/
│   ├── PokemonGame.tsx     # Silhouette mode game
│   ├── TriviaMode.tsx      # Trivia mode game
│   ├── TrainerStats.tsx    # Stats display
│   ├── Navbar.tsx          # Navigation bar
│   ├── ReleaseNotes.tsx    # Version update notifications
│   ├── SettingsModal.tsx   # Settings UI
│   ├── MusicPlayer.tsx     # Minimizable audio controls
│   ├── Pokedex.tsx         # Display component
│   └── GameControls.tsx    # Input & buttons
├── hooks/
│   ├── useAudioPlayer.ts   # BGM management
│   ├── useSoundEffects.ts  # SFX with Web Audio API
│   ├── usePokemonFetch.ts  # API calls with retry logic
│   └── useTriviaFetch.ts   # Trivia question fetching
├── utils/
│   └── statsManager.ts     # Stats tracking & localStorage
└── constants/
    ├── gameConfig.ts       # Configuration constants
    └── versions.ts         # App version & release notes
```

## 🎮 How to Play

### Silhouette Mode (Classic)
1. A Pokémon silhouette appears on the Pokédex screen
2. Type the Pokémon's name in the input field
3. Click "SCAN" to submit your guess
4. Correct guesses reveal the Pokémon and play its cry
5. Build your streak by guessing correctly!

### Trivia Mode
1. Read the Pokédex description (with the Pokémon name censored)
2. Click "Need a Hint?" to reveal the Pokémon's type(s)
3. Type your guess and submit
4. Maintain your streak with correct answers!

### Trainer Stats
- View your current streaks for each game mode
- Track your best streaks and win rates
- Monitor your daily play streak

### Settings

Click the ⚙️ icon to customize:
- **Theme** - Switch between dark and light modes
- **Audio Levels** - Adjust music, cries, and SFX volumes
- **Generations** - Select which Pokémon generations to include (Silhouette mode only)

## 🛠️ Technologies

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Font**: Press Start 2P (Google Fonts)
- **API**: [PokéAPI](https://pokeapi.co/)
- **Audio**: Web Audio API

## ♿ Accessibility

This project follows WCAG 2.1 guidelines:
- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation support
- ✅ Screen reader announcements
- ✅ Minimum 44px touch targets
- ✅ Proper focus management

## 🎨 Features Implemented

- ✅ Component refactoring (modular architecture)
- ✅ Full accessibility compliance
- ✅ Error handling with retry logic
- ✅ Performance optimizations
- ✅ Enhanced SEO metadata
- ✅ Mobile-optimized UX with responsive navbar
- ✅ Multiple game modes (Silhouette, Trivia, Stats)
- ✅ Stats tracking with localStorage
- ✅ Minimizable audio player
- ✅ Release notes system with version tracking
- ✅ Anti-cheat measures

## 📝 License

MIT License - feel free to use this project for learning or personal use.

## 🙏 Credits

- Pokémon data from [PokéAPI](https://pokeapi.co/)
- Music from Pokémon Red/Blue/Yellow
- Inspired by the classic "Who's That Pokémon?" TV segment
- Built with ❤️ by [patsawat.site](https://patsawat.site)

## 🐛 Known Issues

- Browser caching may prevent favicon from updating immediately (hard refresh required)
- Audio autoplay may be blocked on some browsers (click anywhere to enable)

## 🔮 Future Enhancements

- [ ] Daily challenges
- [ ] Achievement system
- [ ] Pokédex collection tracker
- [ ] Leaderboard with backend
- [ ] PWA support
- [ ] More game modes (Speed Run, Type Quiz, etc.)

---

**Gotta guess 'em all!** 🎯
