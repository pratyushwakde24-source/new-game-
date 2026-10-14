import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../stores/useGameStore.ts';
import { useUserStore } from '../stores/useUserStore.ts';
import { Trophy, RotateCcw, Home, Zap, Shield, Compass, Sparkles, Medal } from 'lucide-react';

export const GameOverModal: React.FC = () => {
  const { stats, status, mode, familyPlayers, startGame, resetGame } = useGameStore();
  const { updateAchievementProgress } = useUserStore();

  const isNewHighScore = stats.score > 0 && stats.score >= stats.highScore;

  useEffect(() => {
    if (status === 'game_over') {
      if (isNewHighScore || stats.score > 500) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#a855f7', '#f59e0b', '#3b82f6'],
        });
      }

      // Progress achievements
      updateAchievementProgress('ach_first_steps', stats.sparksCollected);
      if (stats.maxCombo >= 20) updateAchievementProgress('ach_combo_master', 20);
      updateAchievementProgress('ach_gate_pilot', stats.gatesCleared);
      if (stats.score >= 2000) updateAchievementProgress('ach_high_flyer', stats.score);
    }
  }, [status, stats.score, isNewHighScore]);

  // Instant replay keyboard shortcut listener (Space or R)
  useEffect(() => {
    if (status !== 'game_over') return;
    const handleReplayKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        startGame(mode);
      }
    };
    window.addEventListener('keydown', handleReplayKey);
    return () => window.removeEventListener('keydown', handleReplayKey);
  }, [status, mode, startGame]);

  if (status !== 'game_over') return null;

  const earnedXp = Math.round(stats.score * 0.1) + stats.gatesCleared * 15;
  const earnedCoins = Math.round(stats.score * 0.05);

  // Sorted players for Family Tournament mode
  const rankedPlayers = [...familyPlayers].sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900 to-indigo-950 border border-cyan-500/30 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Decorative ambient glows */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-cyan-300 font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Flight Concluded — {mode.toUpperCase()}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white font-display tracking-tight">
            {mode === 'family'
              ? '🏆 TOURNAMENT WINNER!'
              : isNewHighScore
              ? '✨ NEW RECORD!'
              : 'RUN SUMMARY'}
          </h2>
        </div>

        {/* Family Tournament Final Standings */}
        {mode === 'family' ? (
          <div className="bg-slate-950/70 border border-indigo-500/30 rounded-2xl p-4 mb-5 space-y-2.5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
              Final Party Standings
            </div>
            {rankedPlayers.map((player, idx) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  idx === 0
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-sm w-5">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                  <span className="font-bold text-white text-sm">{player.name}</span>
                </div>
                <span className="font-mono font-black text-sm">{player.score.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-950/70 border border-cyan-500/30 rounded-2xl p-5 mb-5 text-center shadow-inner">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Final Score</div>
            <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-violet-400 font-display">
              {stats.score.toLocaleString()}
            </div>
            {stats.highScore > 0 && (
              <div className="text-xs text-amber-300 mt-2 flex items-center justify-center gap-1.5 font-medium">
                <Trophy className="w-3.5 h-3.5" />
                <span>Personal Best: {stats.highScore.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Breakdown Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-5 text-sm">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Sparks
            </span>
            <span className="font-bold text-white">{stats.sparksCollected}</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5 text-xs">
              <Zap className="w-3.5 h-3.5 text-yellow-400" /> Max Combo
            </span>
            <span className="font-bold text-white">{stats.maxCombo}x</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5 text-xs">
              <Shield className="w-3.5 h-3.5 text-violet-400" /> Gates Cleared
            </span>
            <span className="font-bold text-white">{stats.gatesCleared}</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5 text-xs">
              <Compass className="w-3.5 h-3.5 text-emerald-400" /> Distance
            </span>
            <span className="font-bold text-white">{stats.distanceTraveled}m</span>
          </div>
        </div>

        {/* Level & Rewards Earned Bar */}
        <div className="flex items-center justify-between bg-indigo-950/50 border border-indigo-700/40 rounded-xl px-4 py-2.5 mb-6 text-xs font-semibold">
          <span className="text-slate-300">Level {stats.level} Explorer</span>
          <div className="flex items-center gap-3">
            <span className="text-cyan-300">+{earnedXp} XP</span>
            <span className="text-yellow-400">+{earnedCoins} Spark Coins</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => startGame(mode)}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-lg transition shadow-lg shadow-cyan-500/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer font-display"
          >
            <RotateCcw className="w-5 h-5" /> Launch Next Run
          </button>
          <div className="text-center text-[11px] text-slate-400 font-medium">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">R</kbd> for instant replay
          </div>

          <button
            onClick={resetGame}
            className="w-full py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-semibold border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" /> Return to Galaxy Hub
          </button>
        </div>
      </div>
    </div>
  );
};
