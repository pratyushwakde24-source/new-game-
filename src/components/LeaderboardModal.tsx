import React, { useState } from 'react';
import { LeaderboardEntry } from '../types/index.ts';
import { Trophy, Users, ShieldCheck, Flame, X, Share2, Copy } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_GLOBAL_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: 'u_1', username: 'AstroNova', score: 14820, mode: 'Endless', maxCombo: 42, date: 'Today', isPlus: true },
  { rank: 2, userId: 'u_2', username: 'VortexPilot', score: 12450, mode: 'Endless', maxCombo: 38, date: 'Today', isPlus: true },
  { rank: 3, userId: 'u_3', username: 'CosmicDrifter', score: 10890, mode: 'Endless', maxCombo: 31, date: 'Yesterday', isPlus: false },
  { rank: 4, userId: 'u_4', username: 'SolarFlare_07', score: 9640, mode: 'Endless', maxCombo: 28, date: 'Yesterday', isPlus: false },
  { rank: 5, userId: 'u_5', username: 'StarlightEcho', score: 8750, mode: 'Endless', maxCombo: 24, date: '2d ago', isPlus: true },
  { rank: 6, userId: 'u_6', username: 'QuantumSurfer', score: 7920, mode: 'Endless', maxCombo: 21, date: '3d ago', isPlus: false },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'global' | 'friends' | 'challenge'>('global');
  const [copiedCode, setCopiedCode] = useState(false);
  const inviteCode = 'SPARK-7291';

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-white font-display">Galactic Leaderboards</h2>
            <p className="text-xs text-slate-400">Server-validated score rankings</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex border-b border-slate-800 px-6 pt-3 gap-6">
          <button
            onClick={() => setTab('global')}
            className={`pb-3 text-xs md:text-sm font-bold uppercase tracking-wider transition border-b-2 cursor-pointer ${
              tab === 'global' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Global Hall of Fame
          </button>
          <button
            onClick={() => setTab('friends')}
            className={`pb-3 text-xs md:text-sm font-bold uppercase tracking-wider transition border-b-2 cursor-pointer ${
              tab === 'friends' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Friend Races
          </button>
        </div>

        {/* Content */}
        <div className="p-5 md:p-6 overflow-y-auto flex-1">
          {tab === 'global' ? (
            <div className="space-y-2.5">
              {SAMPLE_GLOBAL_LEADERBOARD.map((entry) => {
                const isTop3 = entry.rank <= 3;
                return (
                  <div
                    key={entry.userId}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                      entry.rank === 1
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : entry.rank === 2
                        ? 'bg-slate-800/40 border-slate-600/40'
                        : entry.rank === 3
                        ? 'bg-amber-900/10 border-amber-700/30'
                        : 'bg-slate-950/40 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${
                          entry.rank === 1
                            ? 'bg-amber-500 text-slate-950'
                            : entry.rank === 2
                            ? 'bg-slate-300 text-slate-950'
                            : entry.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {entry.rank}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{entry.username}</span>
                          {entry.isPlus && (
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950">
                              Plus
                            </span>
                          )}
                          <span title="Server Validated">
                            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{entry.mode}</span>
                          <span>•</span>
                          <span>{entry.maxCombo}x combo</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-extrabold text-cyan-300 font-display">
                        {entry.score.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500">{entry.date}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-center">
                <Users className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <h4 className="text-base font-bold text-white font-display mb-1">Invite Friends to Challenge</h4>
                <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                  Share your unique challenge room code so friends can fly the exact same procedural seed!
                </p>

                <div className="flex items-center justify-center gap-3 max-w-xs mx-auto">
                  <div className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 font-mono text-cyan-300 font-bold tracking-widest text-sm">
                    {inviteCode}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition flex items-center gap-1.5 text-xs cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
