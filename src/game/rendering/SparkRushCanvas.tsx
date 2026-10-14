import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useGameStore } from '../../stores/useGameStore.ts';
import { useUserStore } from '../../stores/useUserStore.ts';
import { useSettingsStore } from '../../stores/useSettingsStore.ts';
import { LevelGenerator } from '../generation/levelGenerator.ts';
import { collisionEngine } from '../physics/collisionEngine.ts';
import { Collectible, Obstacle } from '../../types/game.ts';

// Reusable math helpers to guarantee zero Garbage Collection during animation loop
const _vec3 = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _playerTargetPos = new THREE.Vector3(0, 1.2, 0);

interface SparkRushCanvasProps {
  onGameOver?: () => void;
}

export const SparkRushCanvas: React.FC<SparkRushCanvasProps> = ({ onGameOver }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const status = useGameStore((s) => s.status);
  const mode = useGameStore((s) => s.mode);
  const currentSeed = useGameStore((s) => s.currentSeed);
  const speed = useGameStore((s) => s.speed);
  const activePowerups = useGameStore((s) => s.activePowerups);
  const { cosmetics, equippedSkin, equippedEnv } = useUserStore();
  const { settings } = useSettingsStore();

  // Internal game engine references
  const engineRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    clock: THREE.Clock;
    playerMesh: THREE.Group;
    playerInnerMesh: THREE.Mesh;
    playerGlowMesh: THREE.Mesh;
    playerShieldMesh: THREE.Mesh;
    shakeIntensity: number;
    starfield: THREE.Points;
    trackGroup: THREE.Group;
    collectiblesGroup: THREE.Group;
    obstaclesGroup: THREE.Group;
    trailPoints: THREE.Points;
    trailPositions: Float32Array;
    trailHead: number;
    levelGen: LevelGenerator;
    activeChunks: number[];
    currentZ: number;
    playerX: number;
    playerY: number;
    targetPlayerX: number;
    targetPlayerY: number;
    inputKeys: { left: boolean; right: boolean; up: boolean; down: boolean };
    activeCollectibles: Collectible[];
    activeObstacles: Obstacle[];
    animId: number | null;
  } | null>(null);

  // Initialize Three.js scene and 60fps render loop
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const activeEnv = cosmetics.find((c) => c.id === equippedEnv);
    scene.background = new THREE.Color(activeEnv?.color || '#080718');
    scene.fog = new THREE.FogExp2(activeEnv?.color || '#080718', 0.012);

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 400);
    camera.position.set(0, 3.8, 6.5);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: settings.graphicsQuality !== 'low',
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.graphicsQuality === 'high' ? 2 : 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = settings.graphicsQuality === 'high';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Studio Environment Map (PMREMGenerator + RoomEnvironment)
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x67e8f9, 2.0);
    dirLight.position.set(5, 12, 10);
    if (settings.graphicsQuality === 'high') {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.bias = -0.0005;
    }
    scene.add(dirLight);

    const rimLight = new THREE.PointLight(0xa855f7, 3.0, 30);
    rimLight.position.set(-8, 6, -5);
    scene.add(rimLight);

    // 5. Starfield & Cosmic Grid Floor
    const starCount = settings.graphicsQuality === 'low' ? 600 : 1500;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 200;
      starPos[i + 1] = Math.random() * 80 - 10;
      starPos[i + 2] = (Math.random() - 0.5) * 350;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xc4b5fd,
      size: 0.8,
      transparent: true,
      opacity: 0.8,
    });
    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);

    // Floating cyber grid floor
    const gridHelper = new THREE.GridHelper(160, 40, 0x06b6d4, 0x312e81);
    gridHelper.position.set(0, -0.05, 0);
    scene.add(gridHelper);

    // 6. Player Orb Group
    const playerGroup = new THREE.Group();
    playerGroup.position.set(0, 1.2, 0);

    const activeSkin = cosmetics.find((c) => c.id === equippedSkin);
    const primaryColor = new THREE.Color(activeSkin?.color || '#06b6d4');
    const secondaryColor = new THREE.Color(activeSkin?.secondaryColor || '#3b82f6');

    // Inner Core
    const innerGeo = new THREE.SphereGeometry(0.48, 24, 24);
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: primaryColor,
      emissive: primaryColor,
      emissiveIntensity: 0.8,
      roughness: 0.15,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const playerInnerMesh = new THREE.Mesh(innerGeo, innerMat);
    playerInnerMesh.castShadow = true;
    playerGroup.add(playerInnerMesh);

    // Outer Aura Shield
    const glowGeo = new THREE.SphereGeometry(0.62, 20, 20);
    const glowMat = new THREE.MeshStandardMaterial({
      color: secondaryColor,
      emissive: secondaryColor,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });
    const playerGlowMesh = new THREE.Mesh(glowGeo, glowMat);
    playerGroup.add(playerGlowMesh);

    // Dynamic 3D Orbiting Shield Ring
    const shieldGeo = new THREE.TorusGeometry(0.8, 0.04, 12, 32);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.85,
    });
    const playerShieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    playerShieldMesh.rotation.x = Math.PI / 3;
    playerGroup.add(playerShieldMesh);

    // Soft Contact Shadow Plane beneath orb
    const shadowGeo = new THREE.PlaneGeometry(1.4, 1.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = -1.18;
    playerGroup.add(contactShadow);

    scene.add(playerGroup);

    // 7. Particle Trail
    const maxTrailPoints = 60;
    const trailPositions = new Float32Array(maxTrailPoints * 3);
    for (let i = 0; i < maxTrailPoints * 3; i += 3) {
      trailPositions[i] = 0;
      trailPositions[i + 1] = 1.2;
      trailPositions[i + 2] = 0;
    }
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.PointsMaterial({
      color: primaryColor,
      size: 0.45,
      transparent: true,
      opacity: 0.6,
    });
    const trailPoints = new THREE.Points(trailGeo, trailMat);
    scene.add(trailPoints);

    // 8. Collectibles & Obstacles Hierarchies
    const trackGroup = new THREE.Group();
    const collectiblesGroup = new THREE.Group();
    const obstaclesGroup = new THREE.Group();
    scene.add(trackGroup);
    scene.add(collectiblesGroup);
    scene.add(obstaclesGroup);

    // Initialize level generator
    const levelGen = new LevelGenerator(currentSeed);

    engineRef.current = {
      renderer,
      scene,
      camera,
      clock: new THREE.Clock(),
      playerMesh: playerGroup,
      playerInnerMesh,
      playerGlowMesh,
      playerShieldMesh,
      shakeIntensity: 0,
      starfield,
      trackGroup,
      collectiblesGroup,
      obstaclesGroup,
      trailPoints,
      trailPositions,
      trailHead: 0,
      levelGen,
      activeChunks: [],
      currentZ: 0,
      playerX: 0,
      playerY: 1.2,
      targetPlayerX: 0,
      targetPlayerY: 1.2,
      inputKeys: { left: false, right: false, up: false, down: false },
      activeCollectibles: [],
      activeObstacles: [],
      animId: null,
    };

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      const keys = engineRef.current.inputKeys;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = true;
      if (e.key === ' ' || e.key === 'Escape') {
        const currentStatus = useGameStore.getState().status;
        if (currentStatus === 'playing') useGameStore.getState().pauseGame();
        else if (currentStatus === 'paused') useGameStore.getState().resumeGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      const keys = engineRef.current.inputKeys;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = false;
    };

    // Pointer steer interaction
    let isDragging = false;
    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      updatePointerSteer(e);
    };
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging && e.pointerType === 'touch') return;
      updatePointerSteer(e);
    };
    const handlePointerUp = () => {
      isDragging = false;
    };

    const updatePointerSteer = (e: PointerEvent) => {
      if (!engineRef.current || !container) return;
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      // Map to lane boundaries [-3.8 to +3.8]
      engineRef.current.targetPlayerX = Math.max(-3.8, Math.min(3.8, normX * 4.2 * settings.controlSensitivity));
      engineRef.current.targetPlayerY = Math.max(0.6, Math.min(2.8, 1.2 + normY * 1.5));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Resize Handler
    const handleResize = () => {
      if (!container || !engineRef.current) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      engineRef.current.camera.aspect = w / h;
      engineRef.current.camera.updateProjectionMatrix();
      engineRef.current.renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Initial Chunk Spawning
    spawnInitialChunks();

    // 9. Main Animation Loop (60 FPS, Delta Time)
    const renderTick = () => {
      if (!engineRef.current) return;
      const eng = engineRef.current;
      const delta = Math.min(eng.clock.getDelta(), 0.1);
      const curStatus = useGameStore.getState().status;

      if (curStatus === 'playing') {
        // Update game loop in store
        useGameStore.getState().tickGameLoop(delta);
        const currentSpeed = useGameStore.getState().speed;

        // Player movement input handling
        const steerSpeed = 12 * settings.controlSensitivity;
        if (eng.inputKeys.left) eng.targetPlayerX = Math.max(-3.8, eng.targetPlayerX - steerSpeed * delta);
        if (eng.inputKeys.right) eng.targetPlayerX = Math.min(3.8, eng.targetPlayerX + steerSpeed * delta);
        if (eng.inputKeys.up) eng.targetPlayerY = Math.min(2.8, eng.targetPlayerY + steerSpeed * 0.7 * delta);
        if (eng.inputKeys.down) eng.targetPlayerY = Math.max(0.6, eng.targetPlayerY - steerSpeed * 0.7 * delta);

        // Exponential damping for silky smooth motion
        eng.playerX = THREE.MathUtils.damp(eng.playerX, eng.targetPlayerX, 14, delta);
        eng.playerY = THREE.MathUtils.damp(eng.playerY, eng.targetPlayerY, 14, delta);
        eng.currentZ -= currentSpeed * delta;

        // Bank / tilt effect on turning
        const tiltZ = (eng.playerX - eng.targetPlayerX) * 0.25;
        eng.playerMesh.rotation.z = THREE.MathUtils.damp(eng.playerMesh.rotation.z, tiltZ, 10, delta);
        eng.playerMesh.rotation.y += delta * 2.5; // continuous spin
        eng.playerMesh.position.set(eng.playerX, eng.playerY, eng.currentZ);

        // Dynamic shield ring animation
        const currentShields = useGameStore.getState().stats.shields;
        eng.playerShieldMesh.visible = currentShields > 0;
        if (currentShields > 0) {
          eng.playerShieldMesh.rotation.y += delta * 3.5;
          eng.playerShieldMesh.rotation.z += delta * 2.0;
        }

        // Update camera position smoothly tracking player
        _camTarget.set(eng.playerX * 0.5, eng.playerY + 2.2, eng.currentZ + 6.2);
        eng.camera.position.lerp(_camTarget, 0.15);

        // Apply screen shake recoil
        if (eng.shakeIntensity > 0) {
          eng.camera.position.x += (Math.random() - 0.5) * eng.shakeIntensity;
          eng.camera.position.y += (Math.random() - 0.5) * eng.shakeIntensity;
          eng.shakeIntensity = Math.max(0, eng.shakeIntensity - delta * 2.0);
        }

        eng.camera.lookAt(eng.playerX * 0.2, eng.playerY * 0.8, eng.currentZ - 10);

        // Update trail particles
        const posAttr = eng.trailPoints.geometry.getAttribute('position') as THREE.BufferAttribute;
        const trailArray = posAttr.array as Float32Array;
        const headIdx = (eng.trailHead % 60) * 3;
        trailArray[headIdx] = eng.playerX;
        trailArray[headIdx + 1] = eng.playerY;
        trailArray[headIdx + 2] = eng.currentZ;
        eng.trailHead++;
        posAttr.needsUpdate = true;

        // Keep grid floor following player seamlessly
        gridHelper.position.z = Math.floor(eng.currentZ / 4) * 4;

        // Dynamic Chunk Management
        manageChunks(eng.currentZ);

        // Collision Checks
        const hasMagnet = useGameStore.getState().activePowerups.magnetDuration > 0;
        const collision = collisionEngine.checkCollisions(
          [eng.playerX, eng.playerY, eng.currentZ],
          eng.activeCollectibles,
          eng.activeObstacles,
          hasMagnet
        );

        if (collision.collectedSparks.length > 0) {
          collision.collectedSparks.forEach((spark) => {
            useGameStore.getState().onSparkCollected(spark);
            // Hide mesh in 3D scene
            const mesh = eng.collectiblesGroup.getObjectByName(spark.id);
            if (mesh) mesh.visible = false;
          });
        }

        if (collision.clearedGates.length > 0) {
          collision.clearedGates.forEach((gate) => {
            useGameStore.getState().onGateCleared(gate);
          });
        }

        if (collision.hitObstacles.length > 0) {
          eng.shakeIntensity = settings.screenShake ? 0.35 : 0;
          useGameStore.getState().onCollisionHit(collision.hitObstacles[0]);
        }
      } else {
        // Idle camera sweep rotation
        eng.playerMesh.rotation.y += delta * 1.0;
        eng.camera.position.x = Math.sin(Date.now() * 0.0008) * 1.5;
        eng.camera.lookAt(0, 1.2, 0);
      }

      // Rotate visible collectibles for visual shimmer
      eng.collectiblesGroup.children.forEach((c) => {
        if (c.visible) {
          c.rotation.y += delta * 3.0;
          c.rotation.x += delta * 1.5;
        }
      });

      // Animate moving obstacles
      eng.obstaclesGroup.children.forEach((obsMesh) => {
        if ((obsMesh as THREE.Mesh).userData?.speed) {
          const spd = (obsMesh as THREE.Mesh).userData.speed;
          obsMesh.position.x += Math.sin(Date.now() * 0.003) * spd * delta;
        }
      });

      eng.renderer.render(eng.scene, eng.camera);
      eng.animId = requestAnimationFrame(renderTick);
    };

    engineRef.current.animId = requestAnimationFrame(renderTick);

    // Helpers for chunk generation
    function spawnInitialChunks() {
      if (!engineRef.current) return;
      for (let c = 0; c < 3; c++) {
        spawnChunk(c);
      }
    }

    function spawnChunk(chunkIdx: number) {
      if (!engineRef.current || engineRef.current.activeChunks.includes(chunkIdx)) return;
      const chunk = engineRef.current.levelGen.generateChunk(chunkIdx, 70, 1);
      engineRef.current.activeChunks.push(chunkIdx);

      // Add collectibles to 3D scene
      chunk.collectibles.forEach((c) => {
        const sparkMesh = createCollectibleMesh(c);
        engineRef.current?.collectiblesGroup.add(sparkMesh);
        engineRef.current?.activeCollectibles.push(c);
      });

      // Add obstacles to 3D scene
      chunk.obstacles.forEach((obs) => {
        const obsMesh = createObstacleMesh(obs);
        engineRef.current?.obstaclesGroup.add(obsMesh);
        engineRef.current?.activeObstacles.push(obs);
      });
    }

    function manageChunks(currentZ: number) {
      if (!engineRef.current) return;
      const currentChunkIdx = Math.floor(Math.abs(currentZ) / 70);

      // Spawn next chunks ahead
      for (let i = currentChunkIdx; i <= currentChunkIdx + 2; i++) {
        if (!engineRef.current.activeChunks.includes(i)) {
          spawnChunk(i);
        }
      }

      // Prune past chunks (more than 2 chunks behind player)
      const pruneCutoffZ = currentZ + 90;
      engineRef.current.activeCollectibles = engineRef.current.activeCollectibles.filter((c) => {
        if (c.position[2] > pruneCutoffZ) {
          const obj = engineRef.current?.collectiblesGroup.getObjectByName(c.id);
          if (obj) engineRef.current?.collectiblesGroup.remove(obj);
          return false;
        }
        return true;
      });

      engineRef.current.activeObstacles = engineRef.current.activeObstacles.filter((o) => {
        if (o.position[2] > pruneCutoffZ) {
          const obj = engineRef.current?.obstaclesGroup.getObjectByName(o.id);
          if (obj) engineRef.current?.obstaclesGroup.remove(obj);
          return false;
        }
        return true;
      });
    }

    function createCollectibleMesh(item: Collectible): THREE.Mesh {
      let geo: THREE.BufferGeometry;
      let mat: THREE.Material;

      if (item.type === 'special') {
        geo = new THREE.OctahedronGeometry(0.5, 0);
        mat = new THREE.MeshPhysicalMaterial({
          color: 0xf59e0b,
          emissive: 0xf59e0b,
          emissiveIntensity: 1.0,
          roughness: 0.1,
          metalness: 0.9,
          clearcoat: 1.0,
        });
      } else if (item.type === 'magnet') {
        geo = new THREE.TorusGeometry(0.35, 0.12, 12, 24);
        mat = new THREE.MeshStandardMaterial({
          color: 0xec4899,
          emissive: 0xdb2777,
          emissiveIntensity: 0.9,
        });
      } else if (item.type === 'multiplier') {
        geo = new THREE.IcosahedronGeometry(0.45, 0);
        mat = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x059669,
          emissiveIntensity: 0.9,
        });
      } else {
        // Standard Spark
        geo = new THREE.OctahedronGeometry(0.38, 0);
        mat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x0891b2,
          emissiveIntensity: 0.8,
          roughness: 0.2,
          metalness: 0.8,
        });
      }

      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = item.id;
      mesh.position.set(item.position[0], item.position[1], item.position[2]);
      return mesh;
    }

    function createObstacleMesh(obs: Obstacle): THREE.Group | THREE.Mesh {
      if (obs.type === 'gate') {
        // Quantum Gate Portal Frame
        const group = new THREE.Group();
        group.name = obs.id;
        group.position.set(obs.position[0], obs.position[1], obs.position[2]);

        const torusGeo = new THREE.TorusGeometry(1.4, 0.16, 16, 32);
        const torusMat = new THREE.MeshStandardMaterial({
          color: 0x8b5cf6,
          emissive: 0x7c3aed,
          emissiveIntensity: 1.2,
          metalness: 0.9,
          roughness: 0.2,
        });
        const ring = new THREE.Mesh(torusGeo, torusMat);
        group.add(ring);
        return group;
      }

      // Barrier or Moving Pulse
      const boxGeo = new THREE.BoxGeometry(obs.size[0], obs.size[1], obs.size[2]);
      const boxMat = new THREE.MeshStandardMaterial({
        color: obs.type === 'moving_pulse' ? 0xef4444 : 0x4338ca,
        emissive: obs.type === 'moving_pulse' ? 0xdc2626 : 0x3730a3,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.7,
      });
      const boxMesh = new THREE.Mesh(boxGeo, boxMat);
      boxMesh.name = obs.id;
      boxMesh.position.set(obs.position[0], obs.position[1], obs.position[2]);
      if (obs.speed) {
        boxMesh.userData = { speed: obs.speed[0] };
      }
      return boxMesh;
    }

    // Cleanup when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);

      if (engineRef.current?.animId) {
        cancelAnimationFrame(engineRef.current.animId);
      }
      if (engineRef.current?.renderer) {
        engineRef.current.renderer.dispose();
        if (container.contains(engineRef.current.renderer.domElement)) {
          container.removeChild(engineRef.current.renderer.domElement);
        }
      }
      engineRef.current = null;
    };
  }, [equippedSkin, equippedEnv, settings.graphicsQuality, currentSeed]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden cursor-crosshair touch-none"
      style={{ touchAction: 'none' }}
    />
  );
};
