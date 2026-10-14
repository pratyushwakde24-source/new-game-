import { create } from 'zustand';
import { GameMode, PlayerStats, Collectible, Obstacle } from '../types/game.ts';
import { calculateMultiplier, DEFAULT_SCORING_CONFIG } from '../game/scoring/scoringConfig.ts';
import { soundManager } from '../game/audio/soundManager.ts';
import { apiClient } from '../services/apiClient.ts';

export type GameStatus = 'idle' | 'tutorial' | 'playing' | 'paused' | 'game_over' | 'pass_device';

export interface FamilyPlayer {
  id: string;
  name: string;
  score: number;
}

interface GameState {
  status: GameStatus;
  mode: GameMode;
  currentSeed: number;
  stats: PlayerStats;
  speed: number;
  baseSpeed: number;
  playerPos: [number, number, number];
  collectibles: Collectible[];
  obstacles: Obstacle[];
  activePowerups: {
    magnetDuration: number;
    multiplierDuration: number;
    invincibleDuration: number;
  };
  lastComboTime: number;
  recentScorePopup: { points: number; label: string; id: number } | null;
  tutorialStep: number;
  isAudioMuted: boolean;

  // Mode Specific States
  timeRemaining: number; // For Time Trial mode (seconds)
  patternChainCount: number; // For Pattern Quest mode
  familyPlayers: FamilyPlayer[]; // For Family Party mode
  currentFamilyPlayerIdx: number;

  // Actions
  startGame: (mode?: GameMode, seed?: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  setPlayerPos: (pos: [number, number, number]) => void;
  onSparkCollected: (spark: Collectible) => void;
  onGateCleared: (gate: Obstacle) => void;
  onCollisionHit: (obs: Obstacle) => void;
  tickGameLoop: (delta: number) => void;
  setMode: (mode: GameMode) => void;
  advanceTutorial: () => void;
  startFamilyTournament: (playerNames: string[]) => void;
  proceedToNextFamilyPlayer: () => void;
}

const INITIAL_STATS: PlayerStats = {
  score: 0,
  highScore: 0,
  combo: 0,
  maxCombo: 0,
  multiplier: 1.0,
  health: 3,
  maxHealth: 3,
  shields: 1,
  sparksCollected: 0,
  gatesCleared: 0,
  distanceTraveled: 0,
  runDuration: 0,
  level: 1,
  xp: 0,
  nextLevelXp: 100,
  sparkCoins: 0,
};

export const useGameStore = create<GameState>((set, get) => ({
  status: 'idle',
  mode: 'endless',
  currentSeed: 123456,
  stats: { ...INITIAL_STATS },
  speed: 16,
  baseSpeed: 16,
  playerPos: [0, 1.2, 0],
  collectibles: [],
  obstacles: [],
  activePowerups: {
    magnetDuration: 0,
    multiplierDuration: 0,
    invincibleDuration: 0,
  },
  lastComboTime: 0,
  recentScorePopup: null,
  tutorialStep: 0,
  isAudioMuted: false,

  timeRemaining: 60,
  patternChainCount: 0,
  familyPlayers: [
    { id: 'p1', name: 'Player 1', score: 0 },
    { id: 'p2', name: 'Player 2', score: 0 },
  ],
  currentFamilyPlayerIdx: 0,

  startGame: (mode = 'endless', seed) => {
    soundManager.startAmbient();
    const effectiveSeed = seed ?? (mode === 'daily' ? 948271 : Date.now());

    set((state) => ({
      status: 'playing',
      mode,
      currentSeed: effectiveSeed,
      playerPos: [0, 1.2, 0],
      speed: mode === 'zen' ? 12 : 16,
      baseSpeed: mode === 'zen' ? 12 : 16,
      collectibles: [],
      obstacles: [],
      timeRemaining: mode === 'timetrial' ? 60 : 0,
      patternChainCount: 0,
      activePowerups: {
        magnetDuration: 0,
        multiplierDuration: 0,
        invincibleDuration: 0,
      },
      stats: {
        ...INITIAL_STATS,
        highScore: state.stats.highScore,
        sparkCoins: state.stats.sparkCoins,
        level: state.stats.level,
        xp: state.stats.xp,
        health: mode === 'zen' ? 999 : 3,
        shields: mode === 'zen' ? 99 : 1,
      },
    }));
  },

  pauseGame: () => {
    if (get().status === 'playing') {
      set({ status: 'paused' });
    }
  },

  resumeGame: () => {
    if (get().status === 'paused') {
      set({ status: 'playing' });
    }
  },

  endGame: () => {
    soundManager.playGameOver();
    const { stats, mode, currentFamilyPlayerIdx, familyPlayers, currentSeed } = get();
    const currentScore = stats.score;
    const currentHigh = stats.highScore;
    const newHigh = Math.max(currentScore, currentHigh);

    // Persist High Score locally
    try {
      localStorage.setItem('sparkverse_highscore', String(newHigh));
    } catch {}

    // Calculate progression rewards
    const earnedXp = Math.round(stats.score * 0.1) + stats.gatesCleared * 15;
    const earnedCoins = Math.round(stats.score * 0.05);
    const newXp = stats.xp + earnedXp;
    let newLevel = stats.level;
    let nextThreshold = stats.nextLevelXp;
    if (newXp >= nextThreshold) {
      newLevel += 1;
      nextThreshold += 150 * newLevel;
    }

    // Submit score to backend server with anti-cheat validation
    apiClient.submitScore({
      sessionId: 'sess_' + Date.now(),
      score: currentScore,
      mode,
      seed: currentSeed,
      maxCombo: stats.maxCombo,
      durationSeconds: Math.max(5, Math.round(stats.runDuration)),
    }).catch(() => {});

    // Family party mode turn management
    if (mode === 'family') {
      const updatedPlayers = [...familyPlayers];
      if (updatedPlayers[currentFamilyPlayerIdx]) {
        updatedPlayers[currentFamilyPlayerIdx].score = currentScore;
      }

      if (currentFamilyPlayerIdx < familyPlayers.length - 1) {
        set({
          status: 'pass_device',
          familyPlayers: updatedPlayers,
          stats: {
            ...stats,
            highScore: newHigh,
            level: newLevel,
            xp: newXp,
            nextLevelXp: nextThreshold,
            sparkCoins: stats.sparkCoins + earnedCoins,
          },
        });
        return;
      }
    }

    set((state) => ({
      status: 'game_over',
      stats: {
        ...state.stats,
        highScore: newHigh,
        level: newLevel,
        xp: newXp,
        nextLevelXp: nextThreshold,
        sparkCoins: state.stats.sparkCoins + earnedCoins,
      },
    }));
  },

  proceedToNextFamilyPlayer: () => {
    const nextIdx = get().currentFamilyPlayerIdx + 1;
    set({
      currentFamilyPlayerIdx: nextIdx,
      status: 'playing',
      stats: { ...INITIAL_STATS, highScore: get().stats.highScore },
    });
    get().startGame('family');
  },

  startFamilyTournament: (playerNames: string[]) => {
    const players: FamilyPlayer[] = playerNames.map((name, i) => ({
      id: `p_${i + 1}`,
      name: name.trim() || `Player ${i + 1}`,
      score: 0,
    }));
    set({
      familyPlayers: players,
      currentFamilyPlayerIdx: 0,
      mode: 'family',
    });
    get().startGame('family');
  },

  resetGame: () => {
    set((state) => ({
      status: 'idle',
      playerPos: [0, 1.2, 0],
      collectibles: [],
      obstacles: [],
      stats: {
        ...INITIAL_STATS,
        highScore: state.stats.highScore,
        sparkCoins: state.stats.sparkCoins,
        level: state.stats.level,
        xp: state.stats.xp,
      },
    }));
  },

  setPlayerPos: (pos) => set({ playerPos: pos }),

  onSparkCollected: (spark) => {
    const { stats, activePowerups, mode, patternChainCount } = get();
    const newCombo = stats.combo + 1;
    const maxCombo = Math.max(stats.maxCombo, newCombo);
    const multiplier = calculateMultiplier(newCombo) * (activePowerups.multiplierDuration > 0 ? 2 : 1);
    const addedPoints = Math.round(spark.value * multiplier);
    let newScore = stats.score + addedPoints;

    soundManager.playSparkCollect(newCombo);

    // Apply special powerup attributes
    let nextMagnet = activePowerups.magnetDuration;
    let nextMult = activePowerups.multiplierDuration;
    if (spark.type === 'magnet') nextMagnet = 6;
    if (spark.type === 'multiplier') nextMult = 6;

    // Pattern Quest progression bonus
    let nextPatternChain = patternChainCount + 1;
    let popupLabel = `${multiplier > 1 ? multiplier + 'x ' : ''}+${addedPoints}`;
    if (mode === 'pattern' && nextPatternChain >= 5) {
      newScore += 100;
      nextPatternChain = 0;
      popupLabel = 'PATTERN COMPLETE! +100';
      soundManager.playGatePass();
    }

    set({
      lastComboTime: Date.now(),
      patternChainCount: nextPatternChain,
      recentScorePopup: {
        points: addedPoints,
        label: popupLabel,
        id: Date.now(),
      },
      activePowerups: {
        ...activePowerups,
        magnetDuration: nextMagnet,
        multiplierDuration: nextMult,
      },
      stats: {
        ...stats,
        score: newScore,
        combo: newCombo,
        maxCombo,
        multiplier,
        sparksCollected: stats.sparksCollected + 1,
        sparkCoins: stats.sparkCoins + 1,
      },
    });
  },

  onGateCleared: () => {
    const { stats } = get();
    const bonus = DEFAULT_SCORING_CONFIG.gatePassPoints * stats.multiplier;
    soundManager.playGatePass();
    set({
      recentScorePopup: { points: bonus, label: 'PERFECT GATE!', id: Date.now() },
      stats: {
        ...stats,
        score: stats.score + bonus,
        gatesCleared: stats.gatesCleared + 1,
      },
    });
  },

  onCollisionHit: () => {
    const { stats, activePowerups, mode } = get();
    if (mode === 'zen' || activePowerups.invincibleDuration > 0) return;

    soundManager.playCollision();

    // Check shield first
    if (stats.shields > 0) {
      set({
        stats: {
          ...stats,
          shields: stats.shields - 1,
          combo: 0,
          multiplier: 1.0,
        },
        activePowerups: {
          ...activePowerups,
          invincibleDuration: 1.5,
        },
      });
      return;
    }

    const newHealth = stats.health - 1;
    if (newHealth <= 0) {
      set({
        stats: { ...stats, health: 0, combo: 0, multiplier: 1.0 },
      });
      get().endGame();
    } else {
      set({
        stats: {
          ...stats,
          health: newHealth,
          combo: 0,
          multiplier: 1.0,
        },
        activePowerups: {
          ...activePowerups,
          invincibleDuration: 1.5,
        },
      });
    }
  },

  tickGameLoop: (delta: number) => {
    const state = get();
    if (state.status !== 'playing') return;

    // Time Trial mode countdown
    let currentTimeRemaining = state.timeRemaining;
    if (state.mode === 'timetrial') {
      currentTimeRemaining = Math.max(0, state.timeRemaining - delta);
      if (currentTimeRemaining <= 0) {
        get().endGame();
        return;
      }
    }

    // Decay powerups
    const p = state.activePowerups;
    const nextMagnet = Math.max(0, p.magnetDuration - delta);
    const nextMult = Math.max(0, p.multiplierDuration - delta);
    const nextInv = Math.max(0, p.invincibleDuration - delta);

    // Combo timeout check
    let combo = state.stats.combo;
    let mult = state.stats.multiplier;
    if (combo > 0 && Date.now() - state.lastComboTime > DEFAULT_SCORING_CONFIG.comboTimeoutSeconds * 1000) {
      combo = 0;
      mult = 1.0;
    }

    // Distance and time tracking
    const addedDist = state.speed * delta;
    const newDist = state.stats.distanceTraveled + addedDist;
    const newDuration = state.stats.runDuration + delta;

    // Gradual fair speed ramp up capped safely
    const rampedSpeed = Math.min(state.baseSpeed + (newDist / 200), 28);

    set({
      speed: rampedSpeed,
      timeRemaining: currentTimeRemaining,
      activePowerups: {
        magnetDuration: nextMagnet,
        multiplierDuration: nextMult,
        invincibleDuration: nextInv,
      },
      stats: {
        ...state.stats,
        combo,
        multiplier: mult,
        distanceTraveled: Math.round(newDist),
        runDuration: newDuration,
      },
    });
  },

  setMode: (mode) => set({ mode }),
  advanceTutorial: () => set((s) => ({ tutorialStep: s.tutorialStep + 1 })),
}));
