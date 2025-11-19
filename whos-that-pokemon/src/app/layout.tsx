// 1. Import the 'Press Start 2P' font (looks like Gameboy text)
import { Press_Start_2P } from "next/font/google"; 
import "./globals.css";

// 2. Configure the font
const pixelFont = Press_Start_2P({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel", // We can use this variable in Tailwind
});

export const metadata = {
  title: "Who's That Pokémon?",
  description: "Gotta guess 'em all!",
  icons: "/pokelogo.png"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* 3. Apply the font class to the body */}
      <body className={pixelFont.className}>{children}</body>
    </html>
  );
}