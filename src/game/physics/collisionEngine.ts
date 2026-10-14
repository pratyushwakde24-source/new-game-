import * as THREE from 'three';
import { Collectible, Obstacle } from '../../types/game.ts';

// Pre-allocated math objects to avoid garbage collection inside render loop
const _playerPos = new THREE.Vector3();
const _itemPos = new THREE.Vector3();
const _obsBox = new THREE.Box3();
const _obsMin = new THREE.Vector3();
const _obsMax = new THREE.Vector3();

export interface CollisionResult {
  collectedSparks: Collectible[];
  hitObstacles: Obstacle[];
  clearedGates: Obstacle[];
}

export class CollisionEngine {
  public playerRadius: number = 0.5;
  public magnetRadius: number = 2.2;

  public checkCollisions(
    playerCoords: [number, number, number],
    collectibles: Collectible[],
    obstacles: Obstacle[],
    hasMagnet = false
  ): CollisionResult {
    _playerPos.set(playerCoords[0], playerCoords[1], playerCoords[2]);
    const currentMagnetDist = hasMagnet ? this.magnetRadius * 2.2 : this.playerRadius;

    const collectedSparks: Collectible[] = [];
    const hitObstacles: Obstacle[] = [];
    const clearedGates: Obstacle[] = [];

    // Check Collectibles
    for (let i = 0; i < collectibles.length; i++) {
      const item = collectibles[i];
      if (item.collected) continue;

      _itemPos.set(item.position[0], item.position[1], item.position[2]);
      const dist = _playerPos.distanceTo(_itemPos);

      // Magnet attraction
      if (hasMagnet && dist < currentMagnetDist && dist > this.playerRadius + item.radius) {
        // Move spark towards player
        item.position[0] += (_playerPos.x - item.position[0]) * 0.12;
        item.position[1] += (_playerPos.y - item.position[1]) * 0.12;
        item.position[2] += (_playerPos.z - item.position[2]) * 0.12;
      }

      if (dist < (this.playerRadius + item.radius)) {
        item.collected = true;
        collectedSparks.push(item);
      }
    }

    // Check Obstacles & Gates
    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      const halfW = obs.size[0] / 2;
      const halfH = obs.size[1] / 2;
      const halfD = obs.size[2] / 2;

      _obsMin.set(obs.position[0] - halfW, obs.position[1] - halfH, obs.position[2] - halfD);
      _obsMax.set(obs.position[0] + halfW, obs.position[1] + halfH, obs.position[2] + halfD);
      _obsBox.set(_obsMin, _obsMax);

      if (obs.type === 'gate') {
        // Gate check: player passes through aperture
        const zDiff = Math.abs(_playerPos.z - obs.position[2]);
        if (zDiff < 0.6 && !obs.gatePassed) {
          const withinApertureX = Math.abs(_playerPos.x - obs.position[0]) < halfW * 0.9;
          const withinApertureY = Math.abs(_playerPos.y - obs.position[1]) < halfH * 0.9;
          if (withinApertureX && withinApertureY) {
            obs.gatePassed = true;
            clearedGates.push(obs);
          }
        }
      } else if (obs.harmful) {
        // Box vs Sphere intersection
        const closestPoint = new THREE.Vector3();
        _obsBox.clampPoint(_playerPos, closestPoint);
        const distance = _playerPos.distanceTo(closestPoint);

        if (distance < this.playerRadius) {
          hitObstacles.push(obs);
        }
      }
    }

    return {
      collectedSparks,
      hitObstacles,
      clearedGates,
    };
  }
}

export const collisionEngine = new CollisionEngine();
