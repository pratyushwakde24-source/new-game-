import React, { useState } from 'react';
import { useGameStore } from '../stores/useGameStore.ts';
import { useUserStore } from '../stores/useUserStore.ts';
import { Play, Grid, Sparkles, Trophy, Users, Settings, Crown, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

interface NavigationDockProps {
  onOpenModes: () => void;
  onOpenCosmetics: () => void;
  onOpenAchievements: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
  onOpenSubscription: () => void;
  onOpenAdmin: () => void;
}

export const NavigationDock: React.FC<NavigationDockProps> = ({
  onOpenModes,
  onOpenCosmetics,
  onOpenAchievements,
  onOpenLeaderboard,
  onOpenSettings,
  onOpenSubscription,
  onOpenAdmin,
}) => {
  const { status, startGame, mode } = useGameStore();
  const { profile } = useUserStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Keyboard shortcut listener to toggle dock visibility (H)
  React.useEffect(() => {
    const handleToggleKey = (e: KeyboardEvent) => {
      // Don't trigger if user is currently typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'h' || e.key === 'H') {
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleToggleKey);
    return () => window.removeEventListener('keydown', handleToggleKey);
  }, []);

  // During active run, dock is hidden so players have pure unobstructed flight view
  if (status === 'playing') {
    return null;
  }

  return (
    <div
      className="fixed bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center transition-all duration-300"
      style={{
        maxWidth: 'min(940px, 94vw)',
        transform: `translateX(-50%) translateY(${isCollapsed ? 'calc(100% - 28px)' : '0'})`,
      }}
    >
      {/* Collapse / Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mb-1 px-4 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-semibold text-slate-300 backdrop-blur-md transition flex items-center gap-1 shadow-lg cursor-pointer"
        aria-label="Toggle Navigation Dock"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Show Menu (H)</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Hide Menu</span>
          </>
        )}
      </button>

      {/* Main Glassmorphic Dock */}
      <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-2.5 md:p-3 shadow-2xl flex items-center justify-between gap-1.5 md:gap-3 w-full">
        {/* Prominent Play Button */}
        <button
          onClick={() => startGame(mode)}
          className="px-5 md:px-7 py-3 md:py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm md:text-base flex items-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition cursor-pointer font-display shrink-0"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>PLAY RUSH</span>
        </button>

        {/* Action Icon Buttons */}
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={onOpenModes}
            className="p-2.5 md:p-3 rounded-2xl hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition flex flex-col items-center gap-1 cursor-pointer shrink-0"
            title="Game Modes"
          >
            <Grid className="w-5 h-5" />
            <span className="text-[10px] font-bold hidden sm:block">Modes</span>
          </button>

          <button
            onClick={onOpenCosmetics}
            className="p-2.5 md:p-3 rounded-2xl hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition flex flex-col items-center gap-1 cursor-pointer shrink-0"
            title="Wardrobe"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-bold hidden sm:block">Armory</span>
          </button>

          <button
            onClick={onOpenAchievements}
            className="p-2.5 md:p-3 rounded-2xl hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition flex flex-col items-center gap-1 cursor-pointer shrink-0"
            title="Missions & Trophies"
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] font-bold hidden sm:block">Missions</span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="p-2.5 md:p-3 rounded-2xl hover:bg-slate-800 text-slate-300 hover:text-violet-300 transition flex flex-col items-center gap-1 cursor-pointer shrink-0"
            title="Leaderboards"
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-bold hidden sm:block">Ranks</span>
          </button>

          <button
            onClick={onOpenSubscription}
            className="p-2.5 md:p-3 rounded-2xl hover:bg-slate-800 text-amber-400 hover:text-amber-300 transition flex flex-col items-center gap-1 cursor-pointer shrink-0"
            title="Spark Plus"
          >
            <Crown className="w-5 h-5" />
            <span className="text-[10px] font-bold hidden sm:block">Plus</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2.5 md:p-3 rounded-2xl hover:bg-slate-800 text-slate-300 hover:text-white transition flex flex-col items-center gap-1 cursor-pointer shrink-0"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-bold hidden sm:block">Audio/FX</span>
          </button>

          {/* Admin shortcut */}
          <button
            onClick={onOpenAdmin}
            className="p-2.5 md:p-3 rounded-2xl hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition flex flex-col items-center gap-1 cursor-pointer shrink-0"
            title="Admin Console"
          >
            <ShieldAlert className="w-5 h-5" />
            <span className="text-[10px] font-bold hidden sm:block">Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
};
