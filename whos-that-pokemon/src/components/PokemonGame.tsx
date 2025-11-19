"use client";

import { useState, useEffect } from "react";

interface Pokemon {
  name: string;
  image: string;
  id: number;
}

export default function PokemonGame() {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [guess, setGuess] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchPokemon = async () => {
    setLoading(true);
    setIsRevealed(false);
    setIsWinner(false);
    setGuess("");
    setMessage("");
    
    const randomId = Math.floor(Math.random() * 151) + 1;
    
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const data = await res.json();
      
      setPokemon({
        name: data.name,
        image: data.sprites.front_default, 
        id: data.id
      });
    } catch (error) {
      console.error("Failed to fetch Pokemon", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPokemon();
  }, []);

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pokemon) return;

    const cleanGuess = guess.toLowerCase().replace(/[^a-z]/g, "");
    const cleanName = pokemon.name.toLowerCase().replace(/[^a-z]/g, "");

    if (cleanGuess === cleanName) {
      setIsWinner(true);
      setIsRevealed(true);
      setStreak((prev) => prev + 1);
      setMessage(`MATCH: ${pokemon.name.toUpperCase()}`);
    } else {
      setStreak(0);
      setMessage("ERROR: NO MATCH FOUND");
    }
  };

  const handleGiveUp = () => {
    if (!pokemon) return;
    setIsWinner(false);
    setIsRevealed(true);
    setStreak(0);
    setMessage(`DATA: ${pokemon.name.toUpperCase()}`);
  };

  return (
    // THE RED CHASSIS
    <div className="w-full max-w-sm mx-auto bg-red-600 rounded-xl shadow-2xl overflow-hidden border-b-8 border-r-8 border-red-500">
      
      {/* TOP DECORATION (Lights & Lens) */}
      <div className="flex items-start p-4 pb-0 gap-4">
        {/* The Blue Lens with Reflection */}
        <div className="relative w-16 h-16 rounded-full bg-blue-400 border-4 border-white shadow-inner flex-shrink-0">
          <div className="absolute top-2 left-2 w-5 h-5 bg-white rounded-full opacity-50 blur-[1px]"></div>
          {loading && <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-30"></div>}
        </div>
        
        {/* The Three Small Dots */}
        <div className="flex gap-2 mt-2">
          <div className="w-3 h-3 rounded-full bg-red-900 border border-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-100"></div>
          <div className="w-3 h-3 rounded-full bg-green-500 border border-green-200"></div>
        </div>
      </div>

      {/* MAIN SCREEN AREA (Gray Bezel) */}
      <div className="p-6 pt-4">
        <div className="bg-slate-200 rounded-lg p-6 border-b-4 border-r-4 border-slate-400 relative rounded-bl-[3rem]">
          
          {/* The Actual Screen (Black border + Grid) */}
          <div className="bg-slate-900 border-4 border-slate-500 rounded-lg h-48 flex items-center justify-center relative overflow-hidden shadow-inner">
             {/* CSS Grid Pattern Background */}
             <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            
            {loading ? (
              <div className="font-mono text-green-400 animate-pulse">SEARCHING...</div>
            ) : (
              pokemon && (
                <img
                  src={pokemon.image}
                  alt="Pokemon"
                  className={`w-40 h-40 object-contain z-10 rendering-pixelated transition-all duration-500 
                    ${isRevealed 
                      ? "brightness-100 filter-none scale-110" 
                      : "brightness-0 contrast-200 opacity-60"
                    }`}
                />
              )
            )}
          </div>

          {/* Screen Decor (Red dot & Lines) */}
          <div className="flex justify-between items-center mt-2 px-2">
             <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></div>
             <div className="flex flex-col gap-1">
               <div className="w-6 h-0.5 bg-slate-700"></div>
               <div className="w-6 h-0.5 bg-slate-700"></div>
               <div className="w-6 h-0.5 bg-slate-700"></div>
             </div>
          </div>
        </div>
      </div>

      {/* CONTROL PAD AREA */}
      <div className="px-6 pb-6 space-y-4">
        
        {/* Message Screen (Green Digital Text) */}
        <div className="bg-green-900 border-4 border-slate-700 rounded p-2 min-h-[3rem] flex items-center justify-center shadow-inner">
           <span className={`font-mono font-bold tracking-widest text-sm 
             ${isRevealed && !isWinner ? "text-red-500 animate-pulse" : "text-green-400"}`}>
             {message || "AWAITING INPUT..."}
           </span>
        </div>

        {/* Controls */}
        {!isRevealed ? (
          <form onSubmit={handleGuess} className="flex flex-col gap-3">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="ENTER NAME"
              className="w-full bg-slate-800 text-green-400 font-mono p-3 rounded border-2 border-slate-600 focus:outline-none focus:border-blue-500 uppercase placeholder:text-slate-600"
              autoFocus
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 rounded shadow-[0_4px_0_rgb(29,78,216)] active:shadow-none active:translate-y-[4px] transition-all uppercase border-2 border-blue-700">
                scan
              </button>
              <button 
                type="button"
                onClick={handleGiveUp}
                className="w-1/3 bg-yellow-500 hover:bg-yellow-400 text-yellow-900 font-bold py-3 rounded shadow-[0_4px_0_rgb(161,98,7)] active:shadow-none active:translate-y-[4px] transition-all uppercase border-2 border-yellow-700 text-xs"
              >
                Skip
              </button>
            </div>
          </form>
        ) : (
          <div className="flex gap-2">
             <button 
              onClick={fetchPokemon}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded shadow-[0_4px_0_rgb(0,0,0)] active:shadow-none active:translate-y-[4px] transition-all uppercase border-2 border-slate-900"
            >
              {isWinner ? "Search Next" : "Reboot System"}
            </button>
          </div>
        )}
        
        {/* STREAK COUNTER (Bottom Label) */}
        <div className="text-center">
            <span className="text-red-900 font-bold text-xs uppercase tracking-widest bg-red-400 px-2 py-1 rounded">
                Current Streak: {streak}
            </span>
        </div>
      </div>
    </div>
  );
}