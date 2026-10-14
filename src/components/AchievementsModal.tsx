import React, { useEffect } from 'react';
import { useUserStore } from '../stores/useUserStore.ts';
import { useGameStore } from '../stores/useGameStore.ts';
import { apiClient } from '../services/apiClient.ts';
import { Trophy, CheckCircle, Calendar, Zap, Sparkles, X } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose }) => {
  const { achievements, dailyChallenge } = useUserStore();
  const { startGame } = useGameStore();

  useEffect(() => {
    if (isOpen) {
      apiClient.fetchDailyChallenge().then((challenge) => {
        if (challenge) {
          useUserStore.setState((s) => ({
            dailyChallenge: { ...s.dailyChallenge, ...challenge },
          }));
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLaunchDaily = () => {
    startGame('daily', dailyChallenge.seed);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-white font-display">Missions & Achievements</h2>
            <p className="text-xs text-slate-400">Track your milestones and daily voyages</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 md:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Daily Challenge Spotlight */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Synchronized Daily Challenge
              </span>
              <span className="text-xs font-semibold text-slate-400">{dailyChallenge.date}</span>
            </div>

            <h3 className="text-lg font-bold text-white font-display">{dailyChallenge.title}</h3>
            <p className="text-xs text-slate-300 mt-1">{dailyChallenge.description}</p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-amber-500/20">
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-400">Modifier: <strong className="text-amber-300">{dailyChallenge.modifier}</strong></span>
                <span className="text-slate-400">Target: <strong className="text-cyan-300">{dailyChallenge.targetScore} pts</strong></span>
              </div>

              <button
                onClick={handleLaunchDaily}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition shadow-lg active:scale-95 cursor-pointer"
              >
                Launch Daily Flight
              </button>
            </div>
          </div>

          {/* Achievements List */}
          <div>
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Career Milestones</h4>
            <div className="space-y-3">
              {achievements.map((ach) => {
                const pct = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

                return (
                  <div
                    key={ach.id}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 ${
                      ach.unlocked
                        ? 'border-emerald-500/30 bg-emerald-950/10'
                        : 'border-slate-800 bg-slate-950/40'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`p-2.5 rounded-xl border ${
                          ach.unlocked
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-800 border-slate-700 text-slate-500'
                        }`}
                      >
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white font-display">{ach.title}</span>
                          {ach.unlocked && (
                            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                              <CheckCircle className="w-3 h-3" /> Done
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{ach.description}</p>

                        {/* Progress Bar */}
                        <div className="w-48 bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div
                            className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-cyan-300 font-bold block">+{ach.rewardXp} XP</span>
                      <span className="text-amber-400 font-semibold block">+{ach.rewardCoins} Coins</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
