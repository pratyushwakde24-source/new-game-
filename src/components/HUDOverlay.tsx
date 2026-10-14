import React from 'react';
import { useGameStore } from '../stores/useGameStore.ts';
import { useSettingsStore } from '../stores/useSettingsStore.ts';
import { Heart, Shield, Zap, Pause, Play, RotateCcw, Volume2, VolumeX, Clock, Users, Flame } from 'lucide-react';

export const HUDOverlay: React.FC = () => {
  const {
    stats,
    status,
    mode,
    activePowerups,
    recentScorePopup,
    timeRemaining,
    patternChainCount,
    familyPlayers,
    currentFamilyPlayerIdx,
    pauseGame,
    resumeGame,
    resetGame,
    startGame,
    proceedToNextFamilyPlayer,
  } = useGameStore();
  const { settings, updateSetting } = useSettingsStore();

  // Pass Device Screen for Family Party
  if (status === 'pass_device') {
    const nextPlayer = familyPlayers[currentFamilyPlayerIdx + 1];
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
        <div className="bg-gradient-to-b from-indigo-950 to-slate-900 border border-cyan-500/40 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-300 mx-auto flex items-center justify-center mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white font-display">Round Complete!</h2>
          <p className="text-sm text-slate-300 mt-1 mb-5">
            Pass device to: <strong className="text-cyan-400 text-lg block mt-1">{nextPlayer?.name || 'Next Player'}</strong>
          </p>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 mb-6">
            <div className="text-xs text-slate-400 uppercase font-semibold">Previous Turn Score</div>
            <div className="text-3xl font-black text-amber-300 font-display">
              {stats.score.toLocaleString()} pts
            </div>
          </div>

          <button
            onClick={proceedToNextFamilyPlayer}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base shadow-xl active:scale-98 transition cursor-pointer font-display"
          >
            I am Ready — Start My Flight
          </button>
        </div>
      </div>
    );
  }

  if (status !== 'playing' && status !== 'paused') {
    return null;
  }

  const isPaused = status === 'paused';

  // Dynamic color grading for combo badges
  const getComboStyle = (multiplier: number) => {
    if (multiplier >= 4.0) return 'from-rose-600 via-pink-600 to-amber-500 border-amber-300 text-white shadow-rose-500/40';
    if (multiplier >= 2.5) return 'from-amber-500 via-yellow-400 to-amber-600 border-yellow-200 text-slate-950 shadow-yellow-500/40';
    if (multiplier >= 1.5) return 'from-violet-600 to-fuchsia-600 border-violet-400 text-white shadow-violet-500/30';
    return 'from-cyan-600 to-blue-600 border-cyan-400 text-white shadow-cyan-500/20';
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 z-20">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        {/* Score & Combo */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 px-4 py-2.5 rounded-2xl shadow-lg">
            <div className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">Score</div>
            <div className="text-2xl md:text-3xl font-black text-white tracking-tight font-display">
              {stats.score.toLocaleString()}
            </div>
          </div>

          {stats.combo > 0 && (
            <div className={`bg-gradient-to-r ${getComboStyle(stats.multiplier)} backdrop-blur-md px-3.5 py-2 rounded-2xl border text-white shadow-lg animate-bounce`}>
              <div className="flex items-center gap-1.5 font-black text-lg md:text-xl font-display">
                <Zap className="w-5 h-5 fill-current" />
                <span>{stats.multiplier.toFixed(1)}x</span>
              </div>
              <div className="text-[9px] uppercase tracking-wider font-semibold text-center opacity-90">
                {stats.combo} Combo
              </div>
            </div>
          )}
        </div>

        {/* Center Mode Specific Badges */}
        <div className="flex items-center gap-2">
          {mode === 'timetrial' && (
            <div className="flex items-center gap-2 bg-rose-950/80 backdrop-blur-md border border-rose-500/50 px-3.5 py-1.5 rounded-2xl text-rose-200 shadow-lg">
              <Clock className="w-4 h-4 text-rose-400 animate-pulse" />
              <span className="font-mono font-black text-base md:text-lg">
                {Math.ceil(timeRemaining)}s
              </span>
            </div>
          )}

          {mode === 'pattern' && (
            <div className="hidden sm:flex items-center gap-2 bg-violet-950/80 backdrop-blur-md border border-violet-500/40 px-3.5 py-1.5 rounded-2xl text-violet-200 text-xs font-semibold">
              <Zap className="w-4 h-4 text-violet-400" />
              <span>Pattern: {patternChainCount}/5 Sparks</span>
            </div>
          )}

          {mode === 'family' && (
            <div className="flex items-center gap-2 bg-indigo-950/80 backdrop-blur-md border border-indigo-500/40 px-3.5 py-1.5 rounded-2xl text-cyan-300 text-xs font-bold">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Turn: {familyPlayers[currentFamilyPlayerIdx]?.name || 'Player 1'}</span>
            </div>
          )}

          <div className="hidden md:flex flex-col items-center bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 px-4 py-1.5 rounded-xl">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">{mode} Rush</span>
            <span className="text-xs text-cyan-300 font-mono font-medium">{stats.distanceTraveled}m traveled</span>
          </div>
        </div>

        {/* Health, Shields & Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Shields */}
          <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 px-3 py-2 rounded-2xl">
            <Shield className="w-4 h-4 text-cyan-400 fill-cyan-400/30" />
            <span className="text-sm font-bold text-cyan-300">{stats.shields}</span>
          </div>

          {/* Health Hearts (hidden in Zen mode) */}
          {mode !== 'zen' && (
            <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md border border-rose-500/30 px-3 py-2 rounded-2xl">
              {Array.from({ length: Math.min(stats.maxHealth, 3) }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 ${
                    i < stats.health ? 'text-rose-500 fill-rose-500' : 'text-slate-600 fill-slate-800'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Pause Button */}
          <button
            onClick={isPaused ? resumeGame : pauseGame}
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-white transition active:scale-95 shadow-md cursor-pointer"
            aria-label="Pause game"
          >
            {isPaused ? <Play className="w-5 h-5 text-emerald-400 fill-emerald-400" /> : <Pause className="w-5 h-5 text-slate-200" />}
          </button>
        </div>
      </div>

      {/* Organic Contextual Tutorial (First 30 Seconds / 90 Meters) */}
      {stats.distanceTraveled < 90 && (
        <div className="self-center absolute top-20 bg-slate-900/90 border border-cyan-500/40 backdrop-blur-md px-5 py-2 rounded-full text-xs font-bold text-cyan-200 shadow-2xl animate-pulse pointer-events-none tracking-wide text-center">
          {stats.distanceTraveled < 25 ? (
            <span>◀ STEER WITH A / D, ARROWS OR TOUCH TO CATCH SPARKS ▶</span>
          ) : stats.distanceTraveled < 55 ? (
            <span>FLY THROUGH GLOWING PURPLE GATES (+50 PTS)</span>
          ) : (
            <span>CHAIN CONSECUTIVE SPARKS FOR 5.0x COMBO!</span>
          )}
        </div>
      )}

      {/* Floating Score Popup */}
      {recentScorePopup && (
        <div
          key={recentScorePopup.id}
          className="self-center absolute top-28 bg-gradient-to-r from-cyan-500/90 to-blue-600/90 text-white font-black px-5 py-2 rounded-full text-lg shadow-2xl animate-fade-out"
        >
          {recentScorePopup.label}
        </div>
      )}

      {/* Active Powerups Badges */}
      <div className="flex gap-2 self-start mb-2">
        {activePowerups.magnetDuration > 0 && (
          <div className="bg-pink-600/80 text-white text-xs font-bold px-3 py-1 rounded-full border border-pink-400 flex items-center gap-1 shadow-md">
            <span>🧲 Magnet</span>
            <span>{Math.ceil(activePowerups.magnetDuration)}s</span>
          </div>
        )}
        {activePowerups.multiplierDuration > 0 && (
          <div className="bg-emerald-600/80 text-white text-xs font-bold px-3 py-1 rounded-full border border-emerald-400 flex items-center gap-1 shadow-md">
            <span>⚡ 2x Boost</span>
            <span>{Math.ceil(activePowerups.multiplierDuration)}s</span>
          </div>
        )}
        {activePowerups.invincibleDuration > 0 && (
          <div className="bg-amber-600/80 text-white text-xs font-bold px-3 py-1 rounded-full border border-amber-400 flex items-center gap-1 shadow-md">
            <span>🛡️ Grace</span>
            <span>{Math.ceil(activePowerups.invincibleDuration)}s</span>
          </div>
        )}
      </div>

      {/* Mobile Virtual Steer Arrows + Boost Button */}
      {settings.showTouchControls && (
        <div className="w-full flex justify-between items-center px-2 py-2 pointer-events-auto md:hidden">
          <button
            onPointerDown={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
            }}
            onPointerUp={() => {
              window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }));
            }}
            className="w-16 h-16 rounded-2xl bg-cyan-950/80 active:bg-cyan-600 border border-cyan-500/40 text-cyan-200 flex items-center justify-center font-bold text-2xl shadow-xl active:scale-95 cursor-pointer"
            aria-label="Steer Left"
          >
            ◀
          </button>

          {/* Quick Boost / Surge Button */}
          <button
            onPointerDown={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
            }}
            className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 active:from-amber-600 active:to-yellow-500 text-slate-950 font-black text-xs shadow-xl active:scale-95 flex items-center gap-1.5 cursor-pointer font-display border border-amber-300"
            aria-label="Spark Surge Boost"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>BOOST</span>
          </button>

          <button
            onPointerDown={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
            }}
            onPointerUp={() => {
              window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }));
            }}
            className="w-16 h-16 rounded-2xl bg-cyan-950/80 active:bg-cyan-600 border border-cyan-500/40 text-cyan-200 flex items-center justify-center font-bold text-2xl shadow-xl active:scale-95 cursor-pointer"
            aria-label="Steer Right"
          >
            ▶
          </button>
        </div>
      )}

      {/* Pause Menu Modal */}
      {isPaused && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto z-50">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl">
            <h2 className="text-2xl font-black text-white font-display mb-2">Run Paused</h2>
            <p className="text-sm text-slate-400 mb-6">Take a breather, Cosmic Navigator.</p>

            <div className="space-y-3 mb-6">
              <button
                onClick={resumeGame}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold transition shadow-lg active:scale-98 cursor-pointer"
              >
                Resume Flight
              </button>
              <button
                onClick={() => startGame(mode)}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Restart Run
              </button>
              <button
                onClick={resetGame}
                className="w-full py-3 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 font-semibold border border-rose-800/40 transition cursor-pointer"
              >
                Exit to Galaxy Hub
              </button>
            </div>

            {/* Quick volume toggle */}
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-800 text-slate-400">
              <button
                onClick={() => updateSetting('masterVolume', settings.masterVolume > 0 ? 0 : 0.8)}
                className="flex items-center gap-1.5 text-xs hover:text-white cursor-pointer"
              >
                {settings.masterVolume > 0 ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                <span>{settings.masterVolume > 0 ? 'Mute Audio' : 'Unmute Audio'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
