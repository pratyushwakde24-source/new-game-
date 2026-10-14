import { Collectible, Obstacle, CollectibleType, ObstacleType } from '../../types/game.ts';

// Deterministic Linear Congruential Generator (LCG)
export class PRNG {
  private seed: number;

  constructor(seed = 123456789) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  // Returns float [0, 1)
  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  choice<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

export interface GeneratedTrackChunk {
  chunkIndex: number;
  startZ: number;
  endZ: number;
  collectibles: Collectible[];
  obstacles: Obstacle[];
}

export class LevelGenerator {
  private rng: PRNG;
  private trackWidth: number = 8; // X boundary: -4 to +4
  private trackHeight: number = 4; // Y boundary: 0 to 4

  constructor(seed: number = Date.now()) {
    this.rng = new PRNG(seed);
  }

  public setSeed(seed: number) {
    this.rng = new PRNG(seed);
  }

  public generateChunk(chunkIndex: number, length: number = 60, difficultyTier = 1): GeneratedTrackChunk {
    const startZ = -chunkIndex * length;
    const endZ = -(chunkIndex + 1) * length;
    const collectibles: Collectible[] = [];
    const obstacles: Obstacle[] = [];

    // Safe zone for the first chunk
    const isFirstChunk = chunkIndex === 0;
    const stepSpacing = 7;
    const steps = Math.floor(length / stepSpacing);

    for (let i = 0; i < steps; i++) {
      const z = startZ - (i * stepSpacing) - 5;
      const progressRatio = i / steps;

      // Safe zone during early run
      if (isFirstChunk && Math.abs(z) < 25) {
        // Just gentle center sparkles
        collectibles.push({
          id: `spark_${chunkIndex}_${i}_safe`,
          type: 'standard',
          position: [0, 1.2, z],
          radius: 0.55,
          value: 10,
          collected: false,
          spawnTime: 0,
        });
        continue;
      }

      // Pattern 1: Wave or Arc of Sparks
      const patternChoice = Math.floor(this.rng.next() * 5);
      if (patternChoice === 0) {
        // Sine wave sparks
        for (let s = 0; s < 4; s++) {
          const subZ = z - s * 1.6;
          const arcX = Math.sin((subZ * 0.2)) * 3;
          const isSpecial = this.rng.next() > 0.85;
          collectibles.push({
            id: `spark_wave_${chunkIndex}_${i}_${s}`,
            type: isSpecial ? 'special' : 'standard',
            position: [arcX, 1.2 + Math.cos(subZ * 0.15) * 0.6, subZ],
            radius: 0.55,
            value: isSpecial ? 25 : 10,
            collected: false,
            spawnTime: 0,
          });
        }
      } else if (patternChoice === 1) {
        // Gate challenge: obstacle with bonus ring in center
        const gateX = this.rng.range(-2, 2);
        obstacles.push({
          id: `gate_${chunkIndex}_${i}`,
          type: 'gate',
          position: [gateX, 1.5, z],
          size: [2.8, 2.8, 0.4],
          rotation: [0, 0, 0],
          harmful: false,
          requiresGatePass: true,
          gatePassed: false,
        });
        // Center spark inside gate
        collectibles.push({
          id: `spark_gate_${chunkIndex}_${i}`,
          type: 'special',
          position: [gateX, 1.5, z],
          radius: 0.65,
          value: 30,
          collected: false,
          spawnTime: 0,
        });
      } else if (patternChoice === 2) {
        // Twin columns with safe middle path
        const isMagnet = this.rng.next() > 0.92;
        collectibles.push({
          id: `spark_twin_${chunkIndex}_${i}_c`,
          type: isMagnet ? 'magnet' : 'standard',
          position: [0, 1.2, z],
          radius: 0.55,
          value: isMagnet ? 15 : 10,
          collected: false,
          spawnTime: 0,
        });

        // Lateral obstacles
        obstacles.push({
          id: `obs_left_${chunkIndex}_${i}`,
          type: 'barrier',
          position: [-3.2, 1.2, z],
          size: [1.6, 2.0, 0.5],
          rotation: [0, 0, 0],
          harmful: true,
        });
        obstacles.push({
          id: `obs_right_${chunkIndex}_${i}`,
          type: 'barrier',
          position: [3.2, 1.2, z],
          size: [1.6, 2.0, 0.5],
          rotation: [0, 0, 0],
          harmful: true,
        });
      } else if (patternChoice === 3) {
        // Moving prism or pulse barrier (scales with difficulty)
        const obsX = this.rng.choice([-2.2, 0, 2.2]);
        const openX = obsX === 0 ? 2.2 : 0;

        obstacles.push({
          id: `obs_prism_${chunkIndex}_${i}`,
          type: difficultyTier > 2 ? 'moving_pulse' : 'barrier',
          position: [obsX, 1.2, z],
          size: [2.2, 2.2, 0.5],
          rotation: [0, 0, 0],
          speed: difficultyTier > 2 ? [1.5, 0, 0] : undefined,
          harmful: true,
        });

        collectibles.push({
          id: `spark_safe_${chunkIndex}_${i}`,
          type: 'standard',
          position: [openX, 1.2, z],
          radius: 0.55,
          value: 10,
          collected: false,
          spawnTime: 0,
        });
      } else {
        // Trio cluster
        [-1.8, 0, 1.8].forEach((xPos, idx) => {
          collectibles.push({
            id: `spark_cluster_${chunkIndex}_${i}_${idx}`,
            type: idx === 1 && this.rng.next() > 0.8 ? 'multiplier' : 'standard',
            position: [xPos, 1.2, z],
            radius: 0.55,
            value: 10,
            collected: false,
            spawnTime: 0,
          });
        });
      }
    }

    return {
      chunkIndex,
      startZ,
      endZ,
      collectibles,
      obstacles,
    };
  }
}
