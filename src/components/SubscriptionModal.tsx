import React from 'react';
import { useUserStore } from '../stores/useUserStore.ts';
import { Crown, Check, Sparkles, Shield, X } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { profile, toggleSparkPlus } = useUserStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-6 text-center border-b border-amber-500/20 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3">
            <Crown className="w-8 h-8 text-slate-950" />
          </div>

          <h2 className="text-2xl font-black text-white font-display">SPARK PLUS</h2>
          <p className="text-xs text-amber-200/80 mt-1">Cosmetic prestige and advanced flight telemetry</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Zero Pay-to-win notice */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Fair Play Guarantee:</strong> Spark Plus offers zero gameplay advantages or score multipliers. True skill is universal.
            </span>
          </div>

          {/* Feature List */}
          <div className="space-y-3 text-sm">
            {[
              'Exclusive Legendary Skins: Supernova Gold & Void Amethyst',
              'Celestial Aurora Sky & Cosmic Horizon Vistas',
              'Deep Run Telemetry, Velocity Graphs & Analytics',
              'Unlimited Custom Private Challenge Rooms with Friends',
              'Golden Plus Badge on Global Leaderboards',
            ].map((perk, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-200">{perk}</span>
              </div>
            ))}
          </div>

          {/* Pricing Box */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-white font-display">
              $3.99 <span className="text-xs text-slate-400 font-normal">/ month or $29/year</span>
            </div>
            <div className="text-[11px] text-amber-300/80 mt-1">Cancel anytime with one click. Regional currency support included.</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/70">
          <button
            onClick={() => {
              toggleSparkPlus();
              onClose();
            }}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 active:scale-98 transition cursor-pointer font-display"
          >
            {profile.isSparkPlus ? 'Spark Plus Active (Click to Toggle)' : 'Upgrade to Spark Plus'}
          </button>
        </div>
      </div>
    </div>
  );
};
