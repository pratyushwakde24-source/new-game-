import React, { useState } from 'react';
import { useGameStore } from '../stores/useGameStore.ts';
import { Compass, Sparkles, Shield, ArrowRight, Play, X } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const { startGame, mode } = useGameStore();

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Cosmic Steering',
      subtitle: 'Fluid 3D Motion',
      desc: 'Guide your celestial orb with A / D, Arrow Keys, mouse drag, or mobile on-screen buttons. Tilt into curves smoothly.',
      icon: <Compass className="w-8 h-8 text-cyan-400" />,
      tag: 'Step 1 of 3',
    },
    {
      title: 'Chain Reactions',
      subtitle: 'Multiplier Combos',
      desc: 'Collect luminous energy sparks consecutively to escalate your combo multiplier from 1.5x up to 5.0x. Special gold sparks yield 25 points.',
      icon: <Sparkles className="w-8 h-8 text-amber-400" />,
      tag: 'Step 2 of 3',
    },
    {
      title: 'Gates & Shields',
      subtitle: 'Aperture Bonus',
      desc: 'Fly straight through rotating quantum gates for +50pts bonus. Blue shields absorb one hazard collision without ending your run.',
      icon: <Shield className="w-8 h-8 text-violet-400" />,
      tag: 'Step 3 of 3',
    },
  ];

  const current = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
      startGame(mode);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="text-[11px] uppercase font-bold text-cyan-400 tracking-wider block mb-2">{current.tag}</span>

        <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 shadow-lg">
          {current.icon}
        </div>

        <h3 className="text-2xl font-black text-white font-display mb-1">{current.title}</h3>
        <h4 className="text-sm font-semibold text-cyan-300 mb-3">{current.subtitle}</h4>
        <p className="text-xs text-slate-300 leading-relaxed mb-6">{current.desc}</p>

        {/* Step dots */}
        <div className="flex gap-2 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer font-display"
        >
          <span>{step === steps.length - 1 ? 'Launch Flight Now' : 'Next Step'}</span>
          {step === steps.length - 1 ? <Play className="w-4 h-4 fill-white" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
