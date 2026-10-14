import React from 'react';
import { useGameStore } from '../stores/useGameStore.ts';
import { Play, Sparkles, Zap, Shield, HelpCircle, Trophy } from 'lucide-react';

interface WelcomeScreenProps {
  onOpenTutorial: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onOpenTutorial }) => {
  const { status, stats, startGame, mode } = useGameStore();

  if (status !== 'idle') return null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 pointer-events-none">
      <div className="max-w-md w-full text-center pointer-events-auto">
        {/* Glowing badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold mb-4 shadow-lg backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ALL-AGE 3D COSMIC ARCADE</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-6xl font-black text-white font-display tracking-tight drop-shadow-2xl mb-2">
          SPARK<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">VERSE</span>
        </h1>
        <p className="text-sm md:text-base text-slate-300 mb-6 drop-shadow font-medium">
          One More Adventure. Your Next High Score.
        </p>

        {/* High Score Pill if present */}
        {stats.highScore > 0 && (
          <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-amber-500/30 px-4 py-2 rounded-2xl mb-6 shadow-lg backdrop-blur-md">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-300 font-semibold">Personal Record:</span>
            <span className="text-sm font-black text-amber-300 font-display">{stats.highScore.toLocaleString()}</span>
          </div>
        )}

        {/* Primary CTA */}
        <div className="space-y-3">
          <button
            onClick={() => startGame(mode)}
            className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xl shadow-2xl shadow-cyan-500/30 active:scale-98 transition cursor-pointer flex items-center justify-center gap-3 font-display tracking-wide"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>LAUNCH RUN</span>
          </button>

          <button
            onClick={onOpenTutorial}
            className="w-full py-3 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 text-slate-300 font-bold text-xs border border-slate-700/80 transition flex items-center justify-center gap-2 backdrop-blur-sm cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>How to Play & Controls (30s Guide)</span>
          </button>
        </div>

        {/* Micro controls guide */}
        <div className="mt-8 flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">A</kbd>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">D</kbd>
            <span>or Arrows to Steer</span>
          </span>
          <span>•</span>
          <span>Touch or Drag Supported</span>
        </div>
      </div>
    </div>
  );
};
