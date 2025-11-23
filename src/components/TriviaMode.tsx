"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTriviaFetch } from "../hooks/useTriviaFetch";
import { useGameMode } from "../contexts/GameScoreContext";

export default function TriviaMode() {
    const { question, loading, error, fetchTrivia } = useTriviaFetch();
    const [guess, setGuess] = useState("");
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Use GameScore Context
    const { currentStreak, handleWin, handleLoss } = useGameMode('trivia');

    // Initialize daily streak and fetch trivia on mount
    useEffect(() => {
        fetchTrivia();
    }, [fetchTrivia]);

    // Focus input when question loads
    useEffect(() => {
        if (!loading && !isAnswered && inputRef.current) {
            inputRef.current.focus();
        }
    }, [loading, isAnswered]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question || isAnswered || !guess.trim()) return;

        const cleanGuess = guess.toLowerCase().replace(/[^a-z0-9]/g, "");
        const cleanAnswer = question.pokemonName.toLowerCase().replace(/[^a-z0-9]/g, "");

        const correct = cleanGuess === cleanAnswer;
        setIsCorrect(correct);
        setIsAnswered(true);

        if (correct) {
            handleWin();
        } else {
            handleLoss();
        }
    };

    const handleNext = () => {
        setGuess("");
        setIsAnswered(false);
        setIsCorrect(false);
        setShowHint(false);
        fetchTrivia();
    };

    // Anti-spoiler regex
    const getCensoredText = (text: string, name: string) => {
        if (!text || !name) return "";
        const regex = new RegExp(name, "gi");
        return text.replace(regex, "_______");
    };

    if (loading) {
        return (
            <div className="w-full h-[600px] flex flex-col items-center justify-center text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mb-4"></div>
                <p className="text-xl font-mono animate-pulse">DECODING POKEDEX ENTRY...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-[600px] flex flex-col items-center justify-center text-red-400">
                <p className="text-xl mb-4">⚠ {error}</p>
                <button
                    onClick={fetchTrivia}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                >
                    RETRY CONNECTION
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto bg-slate-800/90 backdrop-blur rounded-xl border-4 border-yellow-600 shadow-2xl overflow-hidden flex flex-col">

            {/* Header */}
            <div className="bg-yellow-600 p-4 flex justify-between items-center border-b-4 border-yellow-700">
                <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-md">WHO'S THAT POKÉMON?</h2>
                <div className="bg-slate-900/50 px-5 py-1 md:px-4 rounded-full border border-yellow-400/30">
                    <span className="text-yellow-400 font-mono font-bold text-sm md:text-base">SCORE:{currentStreak}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 md:p-8 flex flex-col items-center flex-grow">

                {/* Flavor Text Box */}
                <div className="w-full bg-slate-900/80 p-6 rounded-lg border border-slate-700 mb-8 relative">
                    <div className="absolute -top-3 -left-3 text-4xl">❝</div>
                    <p className="text-xl md:text-2xl text-center text-slate-200 font-serif leading-relaxed italic">
                        {question && getCensoredText(question.flavorText, question.pokemonName)}
                    </p>
                    <div className="absolute -bottom-3 -right-3 text-4xl">❞</div>
                </div>

                {/* Hint Section */}
                {!isAnswered && (
                    <div className="mb-6 w-full flex flex-col items-center">
                        {!showHint ? (
                            <button
                                onClick={() => setShowHint(true)}
                                className="text-xs text-yellow-500 hover:text-yellow-400 border border-yellow-600/50 hover:border-yellow-500 px-3 py-1 rounded-full transition-colors uppercase tracking-wider"
                            >
                                Need a Hint?
                            </button>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700"
                            >
                                <p className="text-slate-300 text-sm">
                                    <span className="text-yellow-500 font-bold">TYPE HINT:</span> {question?.types.join(" / ").toUpperCase()}
                                </p>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* Answer Section */}
                <AnimatePresence mode="wait">
                    {!isAnswered ? (
                        <motion.form
                            key="input"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            onSubmit={handleSubmit}
                            className="w-full max-w-md flex flex-col md:flex-row gap-3 md:gap-2"
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                value={guess}
                                onChange={(e) => setGuess(e.target.value)}
                                placeholder="Enter Pokémon Name..."
                                className="flex-grow bg-slate-700 text-white px-4 py-3 md:px-6 rounded-lg border-2 border-slate-600 focus:border-yellow-500 focus:outline-none text-base md:text-sm placeholder-slate-400 transition-colors w-full"
                                autoComplete="off"
                            />
                            <button
                                type="submit"
                                disabled={!guess.trim()}
                                className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold px-6 py-3 rounded-lg transition-colors shadow-lg w-full md:w-auto"
                            >
                                GUESS
                            </button>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full flex flex-col items-center"
                        >
                            <div className={`text-center mb-6 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                <h3 className="text-3xl font-bold mb-2">
                                    {isCorrect ? "CORRECT!" : "WRONG!"}
                                </h3>
                                <p className="text-xl text-slate-300">
                                    It was <span className="font-bold text-white">{question?.pokemonName.toUpperCase()}</span>
                                </p>
                            </div>

                            {/* Reveal Image */}
                            {question?.image && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6"
                                >
                                    <img
                                        src={question.image}
                                        alt={question.pokemonName}
                                        className="w-48 h-48 object-contain drop-shadow-xl"
                                    />
                                </motion.div>
                            )}

                            <button
                                onClick={handleNext}
                                autoFocus
                                className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-8 py-3 rounded-full transition-all transform hover:scale-105 shadow-lg border border-slate-500"
                            >
                                NEXT QUESTION ➔
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
