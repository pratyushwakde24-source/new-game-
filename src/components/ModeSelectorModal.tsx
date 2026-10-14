import React, { useState } from 'react';
import { useGameStore } from '../stores/useGameStore.ts';
import { GameMode } from '../types/game.ts';
import { Sparkles, Calendar, Zap, Feather, Clock, Users, Flame, X, Plus, Trash2 } from 'lucide-react';

interface ModeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ModeCard {
  id: GameMode;
  title: string;
  tagline: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
  isAvailable: boolean;
}

const MODES: ModeCard[] = [
  {
    id: 'endless',
    title: 'Endless Rush',
    tagline: 'The definitive cosmic arcade trial. Survive, combo, and ascend the ranks.',
    icon: <Flame className="w-6 h-6 text-cyan-400" />,
    color: 'border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/20',
    badge: 'Popular',
    isAvailable: true,
  },
  {
    id: 'daily',
    title: 'Daily Spark',
    tagline: 'Synchronized daily seed for all players worldwide. Compete on equal ground.',
    icon: <Calendar className="w-6 h-6 text-amber-400" />,
    color: 'border-amber-500/40 hover:border-amber-400 bg-amber-950/20',
    badge: 'Daily Prize',
    isAvailable: true,
  },
  {
    id: 'pattern',
    title: 'Pattern Quest',
    tagline: 'Master complex flight paths, tight gate alignments, and rhythm arcs.',
    icon: <Zap className="w-6 h-6 text-violet-400" />,
    color: 'border-violet-500/40 hover:border-violet-400 bg-violet-950/20',
    isAvailable: true,
  },
  {
    id: 'zen',
    title: 'Zen Journey',
    tagline: 'Invulnerable flight through infinite celestial vistas. No timers, no fail states.',
    icon: <Feather className="w-6 h-6 text-emerald-400" />,
    color: 'border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/20',
    badge: 'Relaxing',
    isAvailable: true,
  },
  {
    id: 'timetrial',
    title: 'Time Trial 60s',
    tagline: '60 seconds on the cosmic clock. Score as many combos as humanly possible.',
    icon: <Clock className="w-6 h-6 text-rose-400" />,
    color: 'border-rose-500/40 hover:border-rose-400 bg-rose-950/20',
    badge: 'Fast Pace',
    isAvailable: true,
  },
  {
    id: 'friend',
    title: 'Friend Challenge',
    tagline: 'Generate private race codes and challenge friends to beat your flight seed.',
    icon: <Sparkles className="w-6 h-6 text-sky-400" />,
    color: 'border-sky-500/40 hover:border-sky-400 bg-sky-950/20',
    isAvailable: true,
  },
  {
    id: 'family',
    title: 'Family Party',
    tagline: 'Local pass-and-play party tournament. Take turns on one device!',
    icon: <Users className="w-6 h-6 text-indigo-400" />,
    color: 'border-indigo-500/40 hover:border-indigo-400 bg-indigo-950/20',
    badge: 'Multiplayer',
    isAvailable: true,
  },
];

export const ModeSelectorModal: React.FC<ModeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { startGame, mode: currentMode, startFamilyTournament } = useGameStore();
  const [familySetupOpen, setFamilySetupOpen] = useState(false);
  const [familyNames, setFamilyNames] = useState<string[]>(['Player 1', 'Player 2']);

  if (!isOpen) return null;

  const handleSelectMode = (mode: GameMode) => {
    if (mode === 'family') {
      setFamilySetupOpen(true);
      return;
    }
    startGame(mode);
    onClose();
  };

  const handleStartFamily = () => {
    startFamilyTournament(familyNames);
    setFamilySetupOpen(false);
    onClose();
  };

  const addFamilyMember = () => {
    if (familyNames.length < 5) {
      setFamilyNames([...familyNames, `Player ${familyNames.length + 1}`]);
    }
  };

  const removeFamilyMember = (idx: number) => {
    if (familyNames.length > 2) {
      setFamilyNames(familyNames.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-white font-display">
              {familySetupOpen ? 'Family Tournament Setup' : 'Select Flight Mode'}
            </h2>
            <p className="text-xs text-slate-400">
              {familySetupOpen
                ? 'Configure players for local pass-and-play'
                : 'Choose your cosmic challenge'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {familySetupOpen ? (
          <div className="p-5 md:p-6 overflow-y-auto space-y-4 flex-1">
            <p className="text-xs text-slate-300">
              Take turns flying the cosmic course on this device. At the end of each flight, the device will prompt the next player!
            </p>

            <div className="space-y-2.5">
              {familyNames.map((name, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-7 text-xs font-bold text-slate-400 font-mono">#{i + 1}</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const updated = [...familyNames];
                      updated[i] = e.target.value;
                      setFamilyNames(updated);
                    }}
                    placeholder={`Player ${i + 1}`}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-semibold focus:outline-none focus:border-cyan-400"
                  />
                  {familyNames.length > 2 && (
                    <button
                      onClick={() => removeFamilyMember(i)}
                      className="p-2 text-rose-400 hover:bg-rose-950/50 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {familyNames.length < 5 && (
              <button
                onClick={addFamilyMember}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500 text-xs text-slate-400 hover:text-cyan-300 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Player
              </button>
            )}

            <div className="pt-4 flex gap-3">
              <button
                onClick={() => setFamilySetupOpen(false)}
                className="w-1/3 py-3 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleStartFamily}
                className="w-2/3 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-black text-sm shadow-lg transition cursor-pointer font-display"
              >
                Start Tournament
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 md:p-6 overflow-y-auto space-y-3.5 flex-1">
            {MODES.map((card) => {
              const isCurrent = currentMode === card.id;
              return (
                <button
                  key={card.id}
                  onClick={() => handleSelectMode(card.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition flex items-center justify-between gap-4 group cursor-pointer ${card.color} ${
                    isCurrent ? 'ring-2 ring-cyan-400' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/50 group-hover:scale-105 transition">
                      {card.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white font-display">{card.title}</span>
                        {card.badge && (
                          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-cyan-500/30">
                            {card.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{card.tagline}</p>
                    </div>
                  </div>

                  <div className="hidden sm:block">
                    <span className="px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-bold group-hover:bg-cyan-500 group-hover:text-white transition">
                      {card.id === 'family' ? 'Configure' : 'Launch'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
