"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useGameScore } from "@/contexts/GameScoreContext";

type ViewType = 'silhouette' | 'trivia' | 'stats' | 'leaderboard';

interface NavbarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onSettingsClick: () => void;
}

export default function Navbar({ currentView, onViewChange, onSettingsClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useGameScore();

  const navItems: { id: ViewType; label: string }[] = [
    { id: 'silhouette', label: 'Silhouette Mode' },
    { id: 'trivia', label: 'Trivia Mode' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'stats', label: 'Trainer Card' },
  ];

  const handleNavClick = (view: ViewType) => {
    onViewChange(view);
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    onSettingsClick();
    setIsOpen(false);
  };

  return (
    <nav className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16">

          {/* Left: Logo / Brand (Optional, but good for structure) */}
          <div className="flex-shrink-0 flex items-center">
            {/* Hidden on mobile if needed, or just a small icon */}
            <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-white shadow-[0_0_10px_rgba(220,38,38,0.5)] animate-pulse md:hidden"></div>
          </div>

          {/* Center: Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center space-x-2 flex-1 mx-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`relative px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 whitespace-nowrap ${currentView === item.id
                  ? 'text-white bg-slate-800 shadow-inner border border-slate-600'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
              >
                {currentView === item.id && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                )}
                {item.label}
              </button>
            ))}
          </div>

          {/* Right: Auth & Settings */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 bg-slate-800 rounded-full px-4 py-1 border border-slate-700">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-400 font-bold">TRAINER</span>
                  <span className="text-sm text-white font-mono leading-none">{user.username}</span>
                </div>
                <button
                  onClick={() => logout()}
                  className="p-1.5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-full transition-colors"
                  title="Logout"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <Link href="/login">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-full transition-colors shadow-lg shadow-blue-600/20">
                  LOGIN
                </button>
              </Link>
            )}

            <button
              onClick={onSettingsClick}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
              aria-label="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden ml-auto">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white p-4 focus:outline-none"
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900 border-b border-slate-700 overflow-hidden shadow-2xl"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {/* Auth Status Mobile */}
              <div className="mb-4 pb-4 border-b border-slate-700">
                {isAuthenticated && user ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-bold">LOGGED IN AS</p>
                      <p className="text-white font-mono text-lg">{user.username}</p>
                    </div>
                    <button
                      onClick={() => logout()}
                      className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold border border-red-500/30"
                    >
                      LOGOUT
                    </button>
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg">
                      LOGIN / REGISTER
                    </button>
                  </Link>
                )}
              </div>

              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full text-left px-4 py-3 rounded-xl text-base font-bold transition-colors ${currentView === item.id
                    ? 'bg-slate-800 text-white border border-slate-600'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  {item.label}
                </button>
              ))}

              <button
                onClick={handleSettingsClick}
                className="block w-full text-left px-4 py-3 rounded-xl text-base font-bold text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                Settings
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
