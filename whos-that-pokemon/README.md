# Who's That Pokémon? 🎮

A nostalgic Pokémon guessing game inspired by the classic "Who's That Pokémon?" TV segment. Test your knowledge across all 9 generations with authentic music and sound effects!

![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

## ✨ Features

- 🎯 **All 9 Generations** - Choose from Gen 1-9 Pokémon
- 🎵 **Authentic Music** - Classic Pokémon soundtrack (Pallet Town, Cinnabar Island, etc.)
- 🔊 **Sound Effects** - Pokémon cries and retro UI sounds
- 🎨 **Retro Design** - Authentic Pokédex aesthetic with pixel font
- ♿ **Accessible** - Full WCAG compliance with ARIA labels and keyboard navigation
- 📱 **Responsive** - Works perfectly on mobile and desktop
- 🌙 **Dark/Light Mode** - Toggle between themes
- 🎮 **Streak Tracking** - Keep track of your winning streak

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
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── PokemonGame.tsx     # Main game orchestrator
│   ├── SettingsModal.tsx   # Settings UI
│   ├── MusicPlayer.tsx     # Audio controls
│   ├── Pokedex.tsx        # Display component
│   └── GameControls.tsx    # Input & buttons
├── hooks/
│   ├── useAudioPlayer.ts   # BGM management
│   ├── useSoundEffects.ts  # SFX with Web Audio API
│   └── usePokemonFetch.ts  # API calls with retry logic
└── constants/
    └── gameConfig.ts       # Configuration constants
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and deploy
4. Your app will be live in minutes!

### Deploy to Netlify

1. Build the project: `npm run build`
2. Deploy the `.next` folder to Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`

### Deploy to Other Platforms

The app is a static Next.js site and can be deployed to:
- GitHub Pages
- Cloudflare Pages
- AWS Amplify
- Railway
- Render

## 🎮 How to Play

1. A Pokémon silhouette appears on the Pokédex screen
2. Type the Pokémon's name in the input field
3. Click "SCAN" to submit your guess
4. Correct guesses reveal the Pokémon and play its cry
5. Build your streak by guessing correctly!

### Settings

Click the ⚙️ icon to customize:
- **Theme** - Switch between dark and light modes
- **Audio Levels** - Adjust music, cries, and SFX volumes
- **Generations** - Select which Pokémon generations to include

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
- ✅ Mobile-optimized UX

## 📝 License

MIT License - feel free to use this project for learning or personal use.

## 🙏 Credits

- Pokémon data from [PokéAPI](https://pokeapi.co/)
- Music from Pokémon Red/Blue/Yellow
- Inspired by the classic "Who's That Pokémon?" TV segment
- Built with ❤️ by [patsawat.kit](https://patsawat.site)

## 🐛 Known Issues

- Browser caching may prevent favicon from updating immediately (hard refresh required)
- Audio autoplay may be blocked on some browsers (click anywhere to enable)

## 🔮 Future Enhancements

- [ ] Multiplayer mode
- [ ] Daily challenges
- [ ] Achievement system
- [ ] Pokédex collection tracker
- [ ] Leaderboard with backend
- [ ] PWA support

---

**Gotta guess 'em all!** 🎯
