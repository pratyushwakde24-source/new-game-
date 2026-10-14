export type GameMode =
  | 'endless'
  | 'daily'
  | 'pattern'
  | 'zen'
  | 'timetrial'
  | 'friend'
  | 'family';

export type CollectibleType = 'standard' | 'special' | 'magnet' | 'shield' | 'multiplier' | 'time_bonus';

export interface Collectible {
  id: string;
  type: CollectibleType;
  position: [number, number, number]; // x, y, z
  radius: number;
  value: number;
  collected: boolean;
  spawnTime: number;
  rotationSpeed?: number;
  pulsePhase?: number;
}

export type ObstacleType = 'barrier' | 'moving_pulse' | 'gate' | 'orbital_mine' | 'quantum_prism';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  position: [number, number, number];
  size: [number, number, number];
  rotation: [number, number, number];
  speed?: [number, number, number];
  harmful: boolean;
  requiresGatePass?: boolean;
  gatePassed?: boolean;
}

export interface PlayerStats {
  score: number;
  highScore: number;
  combo: number;
  maxCombo: number;
  multiplier: number;
  health: number;
  maxHealth: number;
  shields: number;
  sparksCollected: number;
  gatesCleared: number;
  distanceTraveled: number;
  runDuration: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  sparkCoins: number;
}

export interface CosmeticItem {
  id: string;
  name: string;
  description: string;
  category: 'skin' | 'trail' | 'environment' | 'soundpack';
  color: string;
  secondaryColor?: string;
  glowColor?: string;
  unlocked: boolean;
  cost: number;
  isPlusOnly?: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rewardXp: number;
  rewardCoins: number;
  unlockedAt?: string;
}

export interface DailyChallenge {
  id: string;
  date: string;
  title: string;
  description: string;
  seed: number;
  targetScore: number;
  modifier: string;
  multiplierBonus: number;
  completed: boolean;
  bestScore?: number;
}

export interface GameSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  graphicsQuality: 'low' | 'medium' | 'high';
  reducedMotion: boolean;
  highContrast: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  screenShake: boolean;
  haptics: boolean;
  showTouchControls: boolean;
  controlSensitivity: number;
}
