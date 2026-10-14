import { create } from 'zustand';
import { GameSettings } from '../types/game.ts';
import { soundManager } from '../game/audio/soundManager.ts';

interface SettingsState {
  settings: GameSettings;
  updateSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  resetDefaults: () => void;
}

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  sfxVolume: 0.7,
  musicVolume: 0.4,
  graphicsQuality: 'high',
  reducedMotion: false,
  highContrast: false,
  colorBlindMode: 'none',
  screenShake: true,
  haptics: true,
  showTouchControls: true,
  controlSensitivity: 1.0,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: (() => {
    try {
      const saved = localStorage.getItem('sparkverse_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_SETTINGS;
  })(),

  updateSetting: (key, value) => {
    set((state) => {
      const updated = { ...state.settings, [key]: value };
      try {
        localStorage.setItem('sparkverse_settings', JSON.stringify(updated));
      } catch {}

      if (key === 'masterVolume' || key === 'sfxVolume' || key === 'musicVolume') {
        soundManager.setVolumes(updated.masterVolume, updated.sfxVolume, updated.musicVolume);
      }

      return { settings: updated };
    });
  },

  resetDefaults: () => {
    try {
      localStorage.removeItem('sparkverse_settings');
    } catch {}
    set({ settings: DEFAULT_SETTINGS });
    soundManager.setVolumes(DEFAULT_SETTINGS.masterVolume, DEFAULT_SETTINGS.sfxVolume, DEFAULT_SETTINGS.musicVolume);
  },
}));
