import PokemonGame from "@/src/components/PokemonGame";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-slate-900 overflow-hidden">
      
      {/* BACKGROUND PATTERN LAYER */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {/* This creates a repeating Pokeball-like dot pattern using radial gradients */}
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px), radial-gradient(#ffffff 2px, transparent 2px)',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px',
          }}
        ></div>
      </div>

      {/* Optional: A large decorative blurred glow behind the pokedex */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

      {/* GAME COMPONENT */}
      <div className="z-10 w-full">
        <PokemonGame />
      </div>
      
      {/* FOOTER / CREDITS (Resetting font to sans-serif) */}
      <div className="mt-12 text-slate-500 text-sm font-sans z-10 font-medium tracking-wide">
        Project by <a href="https://patsawat.site" className="text-slate-400 hover:text-white transition underline decoration-slate-600">patsawat.kit</a>
        <span className="mx-2">•</span>
        Built with Next.js & Tailwind
      </div>
    </main>
  );
}