import React, { useState } from 'react';
import { useUserStore } from '../stores/useUserStore.ts';
import { useGameStore } from '../stores/useGameStore.ts';
import { Sparkles, Check, Lock, Star, X } from 'lucide-react';

interface CosmeticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CosmeticsModal: React.FC<CosmeticsModalProps> = ({ isOpen, onClose }) => {
  const { cosmetics, equippedSkin, equippedTrail, equippedEnv, equipItem, unlockCosmetic, profile } = useUserStore();
  const { stats } = useGameStore();
  const [tab, setTab] = useState<'skin' | 'trail' | 'environment'>('skin');

  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentItems = cosmetics.filter((c) => c.category === tab);

  const handleEquipOrUnlock = (id: string, cost: number, isUnlocked: boolean, isPlusOnly?: boolean) => {
    if (isPlusOnly && !profile.isSparkPlus) {
      setNotice('This legendary cosmetic requires Spark Plus membership.');
      setTimeout(() => setNotice(null), 3000);
      return;
    }

    if (isUnlocked) {
      if (tab === 'skin') equipItem('skin', id);
      if (tab === 'trail') equipItem('trail', id);
      if (tab === 'environment') equipItem('env', id);
      setNotice('Equipped successfully!');
      setTimeout(() => setNotice(null), 2000);
    } else {
      if (stats.sparkCoins >= cost) {
        useGameStore.setState((s) => ({
          stats: { ...s.stats, sparkCoins: s.stats.sparkCoins - cost },
        }));
        unlockCosmetic(id);
        if (tab === 'skin') equipItem('skin', id);
        if (tab === 'trail') equipItem('trail', id);
        if (tab === 'environment') equipItem('env', id);

        setNotice('Unlocked and equipped!');
        setTimeout(() => setNotice(null), 2500);

        // Sync cloud state
        const currentStats = useGameStore.getState().stats;
        import('../services/apiClient.ts').then(({ apiClient }) => {
          apiClient.syncCloudSave({
            userId: profile.id,
            stats: {
              level: currentStats.level,
              xp: currentStats.xp,
              sparkCoins: currentStats.sparkCoins,
              highScore: currentStats.highScore,
              distanceTraveled: currentStats.distanceTraveled,
            },
            equippedSkin: tab === 'skin' ? id : equippedSkin,
            equippedTrail: tab === 'trail' ? id : equippedTrail,
            equippedEnv: tab === 'environment' ? id : equippedEnv,
            achievements: useUserStore.getState().achievements.map((a) => ({
              id: a.id,
              progress: a.progress,
              unlocked: a.unlocked,
            })),
          });
        });
      } else {
        setNotice(`Need ${cost - stats.sparkCoins} more Spark Coins to unlock this.`);
        setTimeout(() => setNotice(null), 3000);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-white font-display">Orb Armory & Wardrobe</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400">Personalize your celestial essence</span>
              <span className="text-xs text-amber-300 font-bold bg-amber-950/60 border border-amber-600/30 px-2 py-0.5 rounded-full">
                🪙 {stats.sparkCoins} Coins
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {notice && (
          <div className="px-6 py-2 bg-indigo-950/90 border-b border-cyan-500/30 text-xs text-cyan-200 font-semibold text-center animate-fade-in">
            {notice}
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex border-b border-slate-800 px-6 pt-3 gap-4">
          {(['skin', 'trail', 'environment'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setTab(cat)}
              className={`pb-3 text-xs md:text-sm font-bold uppercase tracking-wider transition border-b-2 cursor-pointer ${
                tab === cat
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'skin' ? 'Orb Cores' : cat === 'trail' ? 'Flight Trails' : 'Sky Vistas'}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="p-5 md:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          {currentItems.map((item) => {
            const isEquipped =
              equippedSkin === item.id || equippedTrail === item.id || equippedEnv === item.id;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                  isEquipped
                    ? 'border-cyan-400 bg-cyan-950/20'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border border-white/20"
                      style={{ backgroundColor: item.color }}
                    >
                      <Sparkles className="w-6 h-6 text-white drop-shadow" />
                    </div>
                    {item.isPlusOnly && (
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950">
                        Plus
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-sm font-display">{item.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    {item.unlocked ? 'Unlocked' : `🪙 ${item.cost} Coins`}
                  </span>

                  <button
                    onClick={() => handleEquipOrUnlock(item.id, item.cost, item.unlocked, item.isPlusOnly)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isEquipped
                        ? 'bg-cyan-500 text-slate-950'
                        : item.unlocked
                        ? 'bg-slate-800 text-white hover:bg-slate-700'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isEquipped ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Equipped
                      </>
                    ) : item.unlocked ? (
                      'Equip'
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Unlock
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
