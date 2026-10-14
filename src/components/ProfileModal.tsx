import React, { useState } from 'react';
import { useUserStore } from '../stores/useUserStore.ts';
import { useGameStore } from '../stores/useGameStore.ts';
import { apiClient } from '../services/apiClient.ts';
import { User, ShieldCheck, Cloud, Check, X, Sparkles, Key } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, setProfile, equippedSkin, equippedTrail, equippedEnv, achievements } = useUserStore();
  const { stats } = useGameStore();
  const [usernameInput, setUsernameInput] = useState(profile.username);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveUsername = async () => {
    const trimmed = usernameInput.trim();
    if (!trimmed) return;
    setProfile({ username: trimmed });

    setSyncStatus('Registering profile in database...');
    const res = await apiClient.registerProfile(profile.id, trimmed, profile.isGuest);
    if (res?.success) {
      setSyncStatus('Profile synchronized with database!');
      setTimeout(() => setSyncStatus(null), 2500);
    } else {
      setSyncStatus('Saved locally!');
      setTimeout(() => setSyncStatus(null), 2000);
    }
  };

  const handleManualCloudSync = async () => {
    setSyncStatus('Syncing cloud state...');
    const ok = await apiClient.syncCloudSave({
      userId: profile.id,
      stats: {
        level: stats.level,
        xp: stats.xp,
        sparkCoins: stats.sparkCoins,
        highScore: stats.highScore,
        distanceTraveled: stats.distanceTraveled,
      },
      equippedSkin,
      equippedTrail,
      equippedEnv,
      achievements: achievements.map((a) => ({
        id: a.id,
        progress: a.progress,
        unlocked: a.unlocked,
      })),
    });

    if (ok) {
      setSyncStatus('Cloud save committed successfully!');
      setTimeout(() => setSyncStatus(null), 2500);
    } else {
      setSyncStatus('Offline mode: Saved locally.');
      setTimeout(() => setSyncStatus(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-cyan-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-display">Pilot Identity & Cloud Save</h2>
              <p className="text-xs text-slate-400">PostgreSQL cloud session management</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Notice */}
        {syncStatus && (
          <div className="px-5 py-2 bg-indigo-950 border-b border-cyan-500/40 text-xs text-cyan-300 font-semibold text-center animate-fade-in">
            {syncStatus}
          </div>
        )}

        {/* Form Body */}
        <div className="p-5 md:p-6 space-y-4 text-xs">
          {/* Edit Username */}
          <div>
            <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5 text-[10px]">
              Callsign / Username
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                maxLength={24}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold text-sm focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleSaveUsername}
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>

          {/* Account Metadata Cards */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">User ID:</span>
              <span className="font-mono text-cyan-300 font-bold">{profile.id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Account Type:</span>
              <span className="text-white font-semibold">
                {profile.isGuest ? 'Guest Cloud Session' : 'Registered Pilot'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Spark Plus Status:</span>
              <span className={profile.isSparkPlus ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                {profile.isSparkPlus ? 'Active Member' : 'Standard Tier'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Database Role:</span>
              <span className="font-mono text-emerald-400 uppercase">{profile.role}</span>
            </div>
          </div>

          {/* Manual Cloud Sync Button */}
          <button
            onClick={handleManualCloudSync}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
          >
            <Cloud className="w-4 h-4 text-cyan-400" />
            <span>Force Sync Cloud Save to PostgreSQL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
