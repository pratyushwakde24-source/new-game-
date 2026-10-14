import React from 'react';
import { useSettingsStore } from '../stores/useSettingsStore.ts';
import { Volume2, Monitor, Eye, Sliders, X, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSetting, resetDefaults } = useSettingsStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-white font-display">Flight Settings</h2>
            <p className="text-xs text-slate-400">Audio, graphics, and accessibility calibration</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Audio Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-cyan-400" /> Audio Synthesizer
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-300">Master Volume</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.masterVolume}
                  onChange={(e) => updateSetting('masterVolume', parseFloat(e.target.value))}
                  className="w-36 accent-cyan-400"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-300">Sound Effects</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => updateSetting('sfxVolume', parseFloat(e.target.value))}
                  className="w-36 accent-cyan-400"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-300">Ambient Music</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) => updateSetting('musicVolume', parseFloat(e.target.value))}
                  className="w-36 accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Graphics Section */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-violet-400" /> Visuals & Performance
            </h3>

            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-slate-300 font-medium">Graphics Quality</div>
                <div className="text-xs text-slate-500">Affects shadow resolution and particle count</div>
              </div>
              <select
                value={settings.graphicsQuality}
                onChange={(e) => updateSetting('graphicsQuality', e.target.value as 'low' | 'medium' | 'high')}
                className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-semibold"
              >
                <option value="high">High (60fps PBR)</option>
                <option value="medium">Medium</option>
                <option value="low">Low (Battery Saver)</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-slate-300 font-medium">Screen Shake</div>
                <div className="text-xs text-slate-500">Subtle camera recoil on impact</div>
              </div>
              <input
                type="checkbox"
                checked={settings.screenShake}
                onChange={(e) => updateSetting('screenShake', e.target.checked)}
                className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Accessibility & Controls */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-400" /> Accessibility & Navigation
            </h3>

            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-slate-300 font-medium">Reduced Motion</div>
                <div className="text-xs text-slate-500">Minimizes rotational camera tilting</div>
              </div>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-slate-300 font-medium">On-Screen Mobile Buttons</div>
                <div className="text-xs text-slate-500">Displays prominent virtual steer arrows</div>
              </div>
              <input
                type="checkbox"
                checked={settings.showTouchControls}
                onChange={(e) => updateSetting('showTouchControls', e.target.checked)}
                className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300">Steer Sensitivity</span>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.controlSensitivity}
                onChange={(e) => updateSetting('controlSensitivity', parseFloat(e.target.value))}
                className="w-36 accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-slate-800 flex justify-between items-center bg-slate-950/60">
          <button
            onClick={resetDefaults}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
