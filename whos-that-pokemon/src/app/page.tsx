import PokemonGame from "@/src/components/PokemonGame";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4">
      <PokemonGame />
      
      {/* Footer / Credits */}
      <div className="mt-8 text-slate-500 text-sm">
        Built by <a href="https://patsawat.site" className="hover:text-white underline">patsawat.kit</a> with Next.js
      </div>
    </main>
  );
}