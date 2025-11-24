import { CONFIG } from '../constants/gameConfig';
import { Pokemon } from '../hooks/usePokemonFetch';

interface GameControlsProps {
    pokemon: Pokemon | null;
    guess: string;
    setGuess: (guess: string) => void;
    isRevealed: boolean;
    isWinner: boolean;
    isChecking: boolean;
    message: string;
    streak: number;
    error: string | null;
    handleGuess: (e: React.FormEvent) => Promise<void>;
    handleGiveUp: () => Promise<void>;
    fetchPokemon: () => void;
}

export default function GameControls({
    pokemon,
    guess,
    setGuess,
    isRevealed,
    isWinner,
    isChecking,
    message,
    streak,
    error,
    handleGuess,
    handleGiveUp,
    fetchPokemon,
}: GameControlsProps) {
    return (
        <div className="px-4 md:px-8 pb-4 md:pb-8 space-y-4 md:space-y-6">
            {/* Status Display */}
            <div className="bg-green-900 border-4 border-slate-700 rounded p-2 md:p-4 min-h-[3rem] md:min-h-[4rem] flex items-center justify-center shadow-inner">
                <span
                    className={`font-mono font-bold tracking-widest text-base md:text-xl text-center
            ${isChecking ? "animate-pulse text-yellow-400" : ""}
            ${isRevealed && !isWinner ? "text-red-500" : ""}
            ${isRevealed && isWinner ? "text-green-400" : ""}
            ${!isRevealed && !isChecking ? "text-green-400" : ""}
          `}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {error || message || "AWAITING INPUT..."}
                </span>
            </div>

            {!isRevealed ? (
                <form onSubmit={handleGuess} className="flex flex-col gap-3 md:gap-4">
                    <label htmlFor="pokemon-guess" className="sr-only">
                        Enter Pokemon name
                    </label>
                    <input
                        id="pokemon-guess"
                        type="text"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        disabled={isChecking}
                        placeholder={isChecking ? "PROCESSING..." : "ENTER POKEMON NAME"}
                        className="w-full bg-slate-800 text-green-400 font-mono text-base md:text-xl p-3 md:p-4 rounded border-4 border-slate-600 focus:outline-none focus:border-blue-500 placeholder:text-slate-600 disabled:opacity-50"
                        autoFocus
                        aria-describedby="guess-instructions"
                    />
                    <div id="guess-instructions" className="sr-only">
                        Type the name of the Pokemon shown in silhouette and press Scan to submit your guess
                    </div>

                    <div className="flex gap-3 md:gap-4">
                        <button
                            type="submit"
                            disabled={isChecking || !guess.trim()}
                            className={`flex-1 text-white text-lg md:text-xl font-bold py-3 md:py-4 rounded shadow-[0_4px_0_rgb(29,78,216)] md:shadow-[0_6px_0_rgb(29,78,216)] active:shadow-none active:translate-y-[4px] md:active:translate-y-[6px] transition-all border-2 border-blue-700 min-h-[44px]
                ${isChecking ? "bg-slate-500 shadow-none translate-y-[6px] border-slate-600" : "bg-blue-500 hover:bg-blue-400"}
              `}
                            aria-label="Submit guess"
                        >
                            {isChecking ? "SCANNING..." : "SCAN"}
                        </button>
                        <button
                            type="button"
                            onClick={handleGiveUp}
                            disabled={isChecking}
                            className="w-1/3 bg-yellow-500 hover:bg-yellow-400 text-yellow-900 text-lg md:text-lg font-bold py-3 md:py-4 rounded shadow-[0_4px_0_rgb(161,98,7)] md:shadow-[0_6px_0_rgb(161,98,7)] active:shadow-none active:translate-y-[4px] md:active:translate-y-[6px] transition-all border-2 border-yellow-700 disabled:opacity-50 disabled:shadow-none disabled:translate-y-[6px] min-h-[44px]"
                            aria-label="Skip this Pokemon"
                        >
                            Skip
                        </button>
                    </div>
                </form>
            ) : (
                <div className="flex gap-2">
                    <button
                        onClick={fetchPokemon}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white text-lg md:text-xl font-bold py-4 md:py-5 rounded shadow-[0_6px_0_rgb(0,0,0)] active:shadow-none active:translate-y-[6px] transition-all border-2 border-slate-900 min-h-[44px]"
                        aria-label={isWinner ? "Search for next Pokemon" : "Retry with new Pokemon"}
                    >
                        {isWinner ? "Search Next Pokémon" : "Reboot System"}
                    </button>
                </div>
            )}

            <div className="text-center pt-1 md:pt-2">
                <span
                    className="text-green-900 font-bold text-xs md:text-sm tracking-[0.2em] bg-green-400 px-4 py-2 rounded shadow-sm border border-red-800"
                    role="status"
                    aria-live="polite"
                >
                    Current Streak: {streak}
                </span>
            </div>
        </div>
    );
}
