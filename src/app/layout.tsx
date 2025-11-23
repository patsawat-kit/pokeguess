// 1. Import the 'Press Start 2P' font (looks like Gameboy text)
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import { GameScoreProvider } from "@/contexts/GameScoreContext";

// 2. Configure the font
const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel", // We can use this variable in Tailwind
});

export const metadata = {
  title: "Who's That Pokémon?",
  description: "Test your Pokémon knowledge! Guess the silhouette in this nostalgic game inspired by the classic TV segment. Features all 9 generations with authentic music and sound effects!",
  icons: "/pokemon-logo.png",
  openGraph: {
    title: "Who's That Pokémon?",
    description: "Gotta guess 'em all! Test your knowledge with this nostalgic Pokémon guessing game.",
    type: 'website',
    siteName: "Who's That Pokémon?",
  },
  twitter: {
    card: 'summary_large_image',
    title: "Who's That Pokémon?",
    description: "Gotta guess 'em all! Test your knowledge with this nostalgic Pokémon guessing game.",
  },
  keywords: ['pokemon', 'game', 'quiz', 'guess', 'pokedex', 'nintendo', 'retro', 'nostalgia'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* 3. Apply the font class to the body */}
      <body className={pixelFont.className}>
        <GameScoreProvider>
          {children}
        </GameScoreProvider>
      </body>
    </html>
  );
}