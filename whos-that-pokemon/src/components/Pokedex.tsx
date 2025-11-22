interface Pokemon {
    name: string;
    image: string;
    id: number;
    cry: string;
}

interface PokedexProps {
    loading: boolean;
    isChecking: boolean;
    pokemon: Pokemon | null;
    isRevealed: boolean;
}

export default function Pokedex({ loading, isChecking, pokemon, isRevealed }: PokedexProps) {
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = '/placeholder-pokemon.png';
        e.currentTarget.alt = 'Pokemon image failed to load';
    };

    return (
        <div className="order-2 md:order-1 w-full max-w-2xl bg-red-600 rounded-xl shadow-2xl overflow-hidden border-b-8 border-r-8 border-red-800 relative z-10">

            {/* Top Decor */}
            <div className="flex items-start p-4 md:p-6 pb-0 gap-4 md:gap-6">
                <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-full bg-blue-400 border-4 md:border-8 border-white shadow-inner flex-shrink-0 transition-all">
                    <div className="absolute top-2 left-2 md:top-3 md:left-3 w-4 h-4 md:w-8 md:h-8 bg-white rounded-full opacity-50 blur-[2px]"></div>
                    {(loading || isChecking) && <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-50"></div>}
                </div>

                <div className="flex gap-2 md:gap-3 mt-1 md:mt-2">
                    <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full border-2 border-red-400 ${isChecking ? 'bg-red-500 animate-pulse' : 'bg-red-900'}`}></div>
                    <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full border-2 border-yellow-100 ${isChecking ? 'bg-yellow-300 animate-pulse delay-75' : 'bg-yellow-400'}`}></div>
                    <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full border-2 border-green-200 ${isChecking ? 'bg-green-400 animate-pulse delay-150' : 'bg-green-500'}`}></div>
                </div>
            </div>

            {/* Screen Area */}
            <div className="p-4 md:p-8 pt-4 md:pt-6">
                <div className="bg-slate-200 rounded-lg p-4 md:p-8 border-b-4 border-r-4 border-slate-400 relative rounded-bl-[2rem] md:rounded-bl-[4rem]">

                    <div
                        className="bg-slate-700 border-4 md:border-8 border-slate-500 rounded-lg h-48 sm:h-64 md:h-80 flex items-center justify-center relative overflow-hidden shadow-inner transition-all"
                        role="img"
                        aria-label={loading ? "Loading Pokemon" : isRevealed && pokemon ? `Pokemon: ${pokemon.name}` : "Pokemon silhouette"}
                    >
                        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                        {loading ? (
                            <div className="text-center">
                                <div className="font-mono text-lg md:text-2xl text-green-400 animate-pulse mb-2">SEARCHING...</div>
                                <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                        ) : (
                            pokemon && (
                                <img
                                    src={pokemon.image}
                                    alt={isRevealed ? `Pokemon: ${pokemon.name}` : "Mystery Pokemon"}
                                    className={`w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 object-contain z-10 rendering-pixelated transition-all duration-300
                    ${isRevealed
                                            ? "brightness-100 filter-none scale-110"
                                            : "brightness-0 contrast-200 opacity-60"
                                        }
                    ${isChecking ? "animate-pulse opacity-80 scale-105" : ""} 
                  `}
                                    onError={handleImageError}
                                />
                            )
                        )}
                    </div>

                    <div className="flex justify-between items-center mt-4 px-2 md:px-4">
                        <div
                            className={`w-4 h-4 md:w-5 md:h-5 rounded-full bg-red-600 ${loading || isChecking ? "animate-ping" : ""}`}
                            role="status"
                            aria-label={loading || isChecking ? "Processing" : "Ready"}
                        ></div>
                        <div className="flex flex-col gap-2">
                            <div className="w-8 md:w-10 h-1 bg-slate-700"></div>
                            <div className="w-8 md:w-10 h-1 bg-slate-700"></div>
                            <div className="w-8 md:w-10 h-1 bg-slate-700"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
