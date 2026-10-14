import { create } from 'zustand';
import { UserProfile, CosmeticItem, Achievement, DailyChallenge } from '../types/index.ts';

interface UserState {
  profile: UserProfile;
  cosmetics: CosmeticItem[];
  equippedSkin: string;
  equippedTrail: string;
  equippedEnv: string;
  achievements: Achievement[];
  dailyChallenge: DailyChallenge;
  
  // Actions
  setProfile: (profile: Partial<UserProfile>) => void;
  equipItem: (category: 'skin' | 'trail' | 'env', id: string) => void;
  unlockCosmetic: (id: string) => boolean;
  updateAchievementProgress: (id: string, delta: number) => void;
  completeDailyChallenge: (score: number) => void;
  loginAsGuest: () => void;
  toggleSparkPlus: () => void;
}

const DEFAULT_COSMETICS: CosmeticItem[] = [
  {
    id: 'skin_nebula_cyan',
    name: 'Cyan Nebula',
    description: 'The standard celestial core blazing with electric cyan energy.',
    category: 'skin',
    color: '#06b6d4',
    secondaryColor: '#3b82f6',
    glowColor: '#67e8f9',
    unlocked: true,
    cost: 0,
    rarity: 'common',
  },
  {
    id: 'skin_solar_flare',
    name: 'Solar Flare',
    description: 'Forged in the heart of a young star. Golden radiant corona.',
    category: 'skin',
    color: '#f59e0b',
    secondaryColor: '#ef4444',
    glowColor: '#fde047',
    unlocked: true,
    cost: 100,
    rarity: 'rare',
  },
  {
    id: 'skin_void_violet',
    name: 'Void Violet',
    description: 'Deep cosmic singularity pulsing with dark amethyst light.',
    category: 'skin',
    color: '#8b5cf6',
    secondaryColor: '#ec4899',
    glowColor: '#d8b4fe',
    unlocked: false,
    cost: 250,
    rarity: 'epic',
  },
  {
    id: 'skin_supernova_gold',
    name: 'Supernova Gold',
    description: 'Mythic hypergiant radiance for master cosmic navigators.',
    category: 'skin',
    color: '#ffd700',
    secondaryColor: '#ffffff',
    glowColor: '#fffbeb',
    unlocked: false,
    cost: 500,
    isPlusOnly: true,
    rarity: 'legendary',
  },
  {
    id: 'trail_stardust',
    name: 'Stardust Trail',
    description: 'Sparkling trail of cosmic dust particles.',
    category: 'trail',
    color: '#38bdf8',
    unlocked: true,
    cost: 0,
    rarity: 'common',
  },
  {
    id: 'trail_comet_blaze',
    name: 'Comet Blaze',
    description: 'Intense plasma tail that leaves lingering embers.',
    category: 'trail',
    color: '#f43f5e',
    unlocked: false,
    cost: 150,
    rarity: 'rare',
  },
  {
    id: 'env_deep_space',
    name: 'Deep Cosmos',
    description: 'Midnight purple space studded with crystalline nebulae.',
    category: 'environment',
    color: '#080718',
    unlocked: true,
    cost: 0,
    rarity: 'common',
  },
  {
    id: 'env_aurora_nebula',
    name: 'Aurora Expanse',
    description: 'Vibrant emerald and magenta cosmic auroras.',
    category: 'environment',
    color: '#061727',
    unlocked: false,
    cost: 300,
    isPlusOnly: true,
    rarity: 'epic',
  },
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_steps',
    title: 'Cosmic Ignition',
    description: 'Collect your first 10 energy sparks.',
    icon: 'Sparkles',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    rewardXp: 50,
    rewardCoins: 25,
  },
  {
    id: 'ach_combo_master',
    title: 'Chain Reaction',
    description: 'Reach a 20x combo multiplier.',
    icon: 'Zap',
    unlocked: false,
    progress: 0,
    maxProgress: 20,
    rewardXp: 120,
    rewardCoins: 60,
  },
  {
    id: 'ach_gate_pilot',
    title: 'Aperture Ace',
    description: 'Fly cleanly through 15 quantum gates.',
    icon: 'ShieldCheck',
    unlocked: false,
    progress: 0,
    maxProgress: 15,
    rewardXp: 200,
    rewardCoins: 100,
  },
  {
    id: 'ach_high_flyer',
    title: 'Constellation Pioneer',
    description: 'Score over 2,000 points in a single run.',
    icon: 'Trophy',
    unlocked: false,
    progress: 0,
    maxProgress: 2000,
    rewardXp: 350,
    rewardCoins: 150,
  },
];

export const useUserStore = create<UserState>((set, get) => ({
  profile: {
    id: 'guest_' + Math.random().toString(36).substring(2, 9),
    username: 'SparkRanger',
    avatarSeed: 'cosmic_1',
    isGuest: true,
    isSparkPlus: false,
    createdAt: new Date().toISOString(),
    role: 'player',
  },
  cosmetics: DEFAULT_COSMETICS,
  equippedSkin: 'skin_nebula_cyan',
  equippedTrail: 'trail_stardust',
  equippedEnv: 'env_deep_space',
  achievements: DEFAULT_ACHIEVEMENTS,
  dailyChallenge: {
    id: 'daily_' + new Date().toISOString().slice(0, 10),
    date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    title: 'Hyperdrive Orbit',
    description: 'Double gate frequency with high speed multiplier.',
    seed: 948271,
    targetScore: 1500,
    modifier: '2x Gate Frequency',
    multiplierBonus: 1.5,
    completed: false,
  },

  setProfile: (newProf) =>
    set((state) => ({
      profile: { ...state.profile, ...newProf },
    })),

  equipItem: (category, id) => {
    if (category === 'skin') set({ equippedSkin: id });
    if (category === 'trail') set({ equippedTrail: id });
    if (category === 'env') set({ equippedEnv: id });
  },

  unlockCosmetic: (id: string) => {
    let success = false;
    set((state) => {
      const items = state.cosmetics.map((c) => {
        if (c.id === id) {
          success = true;
          return { ...c, unlocked: true };
        }
        return c;
      });
      return { cosmetics: items };
    });
    return success;
  },

  updateAchievementProgress: (id: string, delta: number) => {
    set((state) => ({
      achievements: state.achievements.map((ach) => {
        if (ach.id !== id || ach.unlocked) return ach;
        const newProgress = Math.min(ach.progress + delta, ach.maxProgress);
        const unlocked = newProgress >= ach.maxProgress;
        return {
          ...ach,
          progress: newProgress,
          unlocked,
          unlockedAt: unlocked ? new Date().toISOString() : undefined,
        };
      }),
    }));
  },

  completeDailyChallenge: (score: number) => {
    set((state) => ({
      dailyChallenge: {
        ...state.dailyChallenge,
        completed: true,
        bestScore: Math.max(state.dailyChallenge.bestScore || 0, score),
      },
    }));
  },

  loginAsGuest: () => {
    set({
      profile: {
        id: 'guest_' + Math.random().toString(36).substring(2, 9),
        username: 'SparkTraveler',
        avatarSeed: 'cosmic_' + Math.floor(Math.random() * 8),
        isGuest: true,
        isSparkPlus: false,
        createdAt: new Date().toISOString(),
        role: 'player',
      },
    });
  },

  toggleSparkPlus: () => {
    set((state) => ({
      profile: {
        ...state.profile,
        isSparkPlus: !state.profile.isSparkPlus,
      },
    }));
  },
}));
