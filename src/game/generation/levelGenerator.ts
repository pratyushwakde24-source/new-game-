import { Collectible, Obstacle } from '../../types/game.ts';

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

  constructor(seed: number = Date.now()) {
    this.rng = new PRNG(seed);
  }

  public setSeed(seed: number) {
    this.rng = new PRNG(seed);
  }

  public generateChunk(chunkIndex: number, length: number = 70, difficultyTier = 1): GeneratedTrackChunk {
    const startZ = -chunkIndex * length;
    const endZ = -(chunkIndex + 1) * length;
    const collectibles: Collectible[] = [];
    const obstacles: Obstacle[] = [];

    const isFirstChunk = chunkIndex === 0;
    const stepSpacing = 7;
    const steps = Math.floor(length / stepSpacing);

    for (let i = 0; i < steps; i++) {
      const z = startZ - i * stepSpacing - 4;

      // ---------------------------------------------------------
      // FIRST 30 SECONDS / INTRODUCTORY ORGANIC TUTORIAL
      // ---------------------------------------------------------
      if (isFirstChunk && Math.abs(z) < 45) {
        if (Math.abs(z) < 14) {
          // Phase 1: Pure center collection (teaches forward collection)
          collectibles.push({
            id: `spark_intro_center_${i}`,
            type: 'standard',
            position: [0, 1.2, z],
            radius: 0.55,
            value: 10,
            collected: false,
            spawnTime: 0,
          });
        } else if (Math.abs(z) < 28) {
          // Phase 2: Gentle S-arc (teaches left / right steering)
          const arcX = Math.sin((z + 14) * 0.3) * 2.2;
          collectibles.push({
            id: `spark_intro_arc_${i}`,
            type: 'standard',
            position: [arcX, 1.2, z],
            radius: 0.55,
            value: 10,
            collected: false,
            spawnTime: 0,
          });
        } else {
          // Phase 3: Centered Quantum Gate (teaches gate passing without danger)
          if (i === 4) {
            obstacles.push({
              id: `gate_intro_${i}`,
              type: 'gate',
              position: [0, 1.5, z],
              size: [3.0, 3.0, 0.4],
              rotation: [0, 0, 0],
              harmful: false,
              requiresGatePass: true,
              gatePassed: false,
            });
            collectibles.push({
              id: `spark_intro_gate_${i}`,
              type: 'special',
              position: [0, 1.5, z],
              radius: 0.65,
              value: 30,
              collected: false,
              spawnTime: 0,
            });
          }
        }
        continue;
      }

      // ---------------------------------------------------------
      // PROCEDURAL RUN PATTERNS (FAIR, DETERMINISTIC & ADAPTIVE)
      // ---------------------------------------------------------
      const patternChoice = Math.floor(this.rng.next() * 7);

      if (patternChoice === 0) {
        // Pattern 1: High-Elevation Sine Wave
        for (let s = 0; s < 4; s++) {
          const subZ = z - s * 1.5;
          const arcX = Math.sin(subZ * 0.22) * 2.8;
          const arcY = 1.2 + Math.cos(subZ * 0.22) * 0.6;
          const isSpecial = this.rng.next() > 0.85;

          collectibles.push({
            id: `spark_wave_${chunkIndex}_${i}_${s}`,
            type: isSpecial ? 'special' : 'standard',
            position: [arcX, arcY, subZ],
            radius: 0.55,
            value: isSpecial ? 25 : 10,
            collected: false,
            spawnTime: 0,
          });
        }
      } else if (patternChoice === 1) {
        // Pattern 2: Quantum Aperture Gate
        const gateX = this.rng.range(-2.2, 2.2);
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
        // Pattern 3: Slalom Corridor with Side Pylons
        const isMagnet = this.rng.next() > 0.88;
        collectibles.push({
          id: `spark_slalom_${chunkIndex}_${i}`,
          type: isMagnet ? 'magnet' : 'standard',
          position: [0, 1.2, z],
          radius: 0.55,
          value: isMagnet ? 15 : 10,
          collected: false,
          spawnTime: 0,
        });

        // Twin lateral barriers with safe central aisle
        obstacles.push({
          id: `obs_left_${chunkIndex}_${i}`,
          type: 'barrier',
          position: [-3.2, 1.2, z],
          size: [1.6, 2.2, 0.5],
          rotation: [0, 0, 0],
          harmful: true,
        });
        obstacles.push({
          id: `obs_right_${chunkIndex}_${i}`,
          type: 'barrier',
          position: [3.2, 1.2, z],
          size: [1.6, 2.2, 0.5],
          rotation: [0, 0, 0],
          harmful: true,
        });
      } else if (patternChoice === 3) {
        // Pattern 4: Oscillating Barrier or Prism with Clear Counter-Pocket
        const obsX = this.rng.choice([-2.0, 0, 2.0]);
        const safeX = obsX === 0 ? (this.rng.next() > 0.5 ? -2.2 : 2.2) : 0;

        obstacles.push({
          id: `obs_pulse_${chunkIndex}_${i}`,
          type: difficultyTier > 1 ? 'moving_pulse' : 'barrier',
          position: [obsX, 1.2, z],
          size: [2.2, 2.2, 0.5],
          rotation: [0, 0, 0],
          speed: difficultyTier > 1 ? [1.4, 0, 0] : undefined,
          harmful: true,
        });

        collectibles.push({
          id: `spark_dodge_reward_${chunkIndex}_${i}`,
          type: 'special',
          position: [safeX, 1.2, z],
          radius: 0.6,
          value: 25,
          collected: false,
          spawnTime: 0,
        });
      } else if (patternChoice === 4) {
        // Pattern 5: Horizontal Triple Cluster
        const isMultiplier = this.rng.next() > 0.85;
        [-1.8, 0, 1.8].forEach((xPos, idx) => {
          collectibles.push({
            id: `spark_trio_${chunkIndex}_${i}_${idx}`,
            type: idx === 1 && isMultiplier ? 'multiplier' : 'standard',
            position: [xPos, 1.2, z],
            radius: 0.55,
            value: 10,
            collected: false,
            spawnTime: 0,
          });
        });
      } else if (patternChoice === 5) {
        // Pattern 6: Double Gate Cascade (Rhythm Gate)
        const gate1X = -1.6;
        const gate2X = 1.6;
        obstacles.push({
          id: `gate_cascade_1_${chunkIndex}_${i}`,
          type: 'gate',
          position: [gate1X, 1.5, z],
          size: [2.6, 2.6, 0.4],
          rotation: [0, 0, 0],
          harmful: false,
          requiresGatePass: true,
          gatePassed: false,
        });
        collectibles.push({
          id: `spark_cascade_1_${chunkIndex}_${i}`,
          type: 'standard',
          position: [gate1X, 1.5, z],
          radius: 0.55,
          value: 15,
          collected: false,
          spawnTime: 0,
        });

        obstacles.push({
          id: `gate_cascade_2_${chunkIndex}_${i}`,
          type: 'gate',
          position: [gate2X, 1.5, z - 3.5],
          size: [2.6, 2.6, 0.4],
          rotation: [0, 0, 0],
          harmful: false,
          requiresGatePass: true,
          gatePassed: false,
        });
        collectibles.push({
          id: `spark_cascade_2_${chunkIndex}_${i}`,
          type: 'special',
          position: [gate2X, 1.5, z - 3.5],
          radius: 0.6,
          value: 25,
          collected: false,
          spawnTime: 0,
        });
      } else {
        // Pattern 7: Relaxed Star Stream (Gentle Breathing Pocket)
        for (let s = 0; s < 3; s++) {
          collectibles.push({
            id: `spark_stream_${chunkIndex}_${i}_${s}`,
            type: 'standard',
            position: [(this.rng.next() - 0.5) * 3, 1.2, z - s * 2],
            radius: 0.55,
            value: 10,
            collected: false,
            spawnTime: 0,
          });
        }
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
