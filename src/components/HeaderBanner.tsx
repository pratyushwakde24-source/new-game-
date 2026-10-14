import React from 'react';
import { useGameStore } from '../stores/useGameStore.ts';
import { useUserStore } from '../stores/useUserStore.ts';
import { useSettingsStore } from '../stores/useSettingsStore.ts';
import { Sparkles, Volume2, VolumeX, Shield, User, Settings } from 'lucide-react';

interface HeaderBannerProps {
  onOpenSettings: () => void;
  onOpenProfile?: () => void;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({ onOpenSettings, onOpenProfile }) => {
  const { status, mode } = useGameStore();
  const { profile } = useUserStore();
  const { settings, updateSetting } = useSettingsStore();

  if (status === 'playing') return null;

  return (
    <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
      {/* Brand & Tagline Badge */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl px-4 py-2.5 shadow-xl flex items-center gap-3 pointer-events-auto">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tight text-white font-display flex items-center gap-1.5">
            <span>SPARKVERSE</span>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest border border-cyan-500/30 px-1.5 py-0.2 rounded-full">
              3D
            </span>
          </h1>
          <p className="text-[11px] text-slate-400">One More Adventure. Your Next High Score.</p>
        </div>
      </div>

      {/* User profile & Quick Audio Toggle */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        <button
          onClick={onOpenProfile}
          className="bg-slate-900/80 hover:bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-2xl px-3.5 py-2 shadow-xl flex items-center gap-2 transition cursor-pointer text-left"
          title="Manage Pilot Profile & Cloud Save"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-cyan-300">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
              <span>{profile.username}</span>
              {profile.isSparkPlus && (
                <span className="text-[9px] uppercase font-black text-amber-400">Plus</span>
              )}
            </div>
            <span className="text-[10px] text-cyan-300">Cloud Pilot (Click to Edit)</span>
          </div>
        </button>

        <button
          onClick={() => updateSetting('masterVolume', settings.masterVolume > 0 ? 0 : 0.8)}
          className="p-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white transition shadow-xl cursor-pointer"
          title={settings.masterVolume > 0 ? 'Mute Audio' : 'Unmute Audio'}
        >
          {settings.masterVolume > 0 ? (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white transition shadow-xl cursor-pointer"
          title="Open Flight Settings"
        >
          <Settings className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </div>
  );
};
