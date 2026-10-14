import { calculateMultiplier, DEFAULT_SCORING_CONFIG } from '../src/game/scoring/scoringConfig.ts';
import { PRNG, LevelGenerator } from '../src/game/generation/levelGenerator.ts';
import { collisionEngine } from '../src/game/physics/collisionEngine.ts';
import { scoreValidator } from '../server/game-validation/scoreValidator.ts';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, errorMsg?: string) {
  if (condition) {
    results.push({ name: testName, passed: true });
    console.log(`  ✓ ${testName}`);
  } else {
    results.push({ name: testName, passed: false, error: errorMsg || 'Assertion failed' });
    console.error(`  ✗ ${testName} - ${errorMsg || 'Assertion failed'}`);
  }
}

console.log('\n========================================');
console.log('SPARKVERSE AUTOMATED TEST SUITE');
console.log('========================================\n');

// 1. Scoring & Combo Logic Tests
console.log('[1/4] Testing Scoring & Combo Logic:');
assert(calculateMultiplier(0) === 1.0, 'Initial combo multiplier is 1.0x');
assert(calculateMultiplier(5) === 1.5, '5 combo yields 1.5x multiplier');
assert(calculateMultiplier(10) === 2.0, '10 combo yields 2.0x multiplier');
assert(calculateMultiplier(20) === 2.5, '20 combo yields 2.5x multiplier');
assert(calculateMultiplier(50) === 4.0, '50 combo yields 4.0x multiplier');
assert(calculateMultiplier(100) === 5.0, 'Multiplier caps at 5.0x ceiling');

// 2. Procedural PRNG & Determinism Tests
console.log('\n[2/4] Testing PRNG & Daily Seed Reproducibility:');
const rng1 = new PRNG(948271);
const rng2 = new PRNG(948271);
const seq1 = [rng1.next(), rng1.next(), rng1.next()];
const seq2 = [rng2.next(), rng2.next(), rng2.next()];
assert(
  JSON.stringify(seq1) === JSON.stringify(seq2),
  'Identical seeds generate identical deterministic sequences'
);

const levelGen = new LevelGenerator(948271);
const chunk0 = levelGen.generateChunk(0, 60, 1);
assert(chunk0.collectibles.length > 0, 'Chunk 0 generates safe collectible path');
assert(chunk0.startZ === 0 && chunk0.endZ === -60, 'Chunk Z bounds are accurate');

// 3. Collision Engine Tests
console.log('\n[3/4] Testing Collision Engine:');
const dummySpark = {
  id: 'test_spark',
  type: 'standard' as const,
  position: [0, 1.2, -5] as [number, number, number],
  radius: 0.5,
  value: 10,
  collected: false,
  spawnTime: 0,
};
const dummyObs = {
  id: 'test_obs',
  type: 'barrier' as const,
  position: [0, 1.2, -10] as [number, number, number],
  size: [2, 2, 0.5] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
  harmful: true,
};

// Check direct hit with spark
const hitRes = collisionEngine.checkCollisions([0, 1.2, -5], [dummySpark], [dummyObs], false);
assert(hitRes.collectedSparks.length === 1, 'Player collects spark upon contact');
assert(dummySpark.collected === true, 'Spark marked as collected');

// Check direct hit with barrier
const barrierHitRes = collisionEngine.checkCollisions([0, 1.2, -10], [], [dummyObs], false);
assert(barrierHitRes.hitObstacles.length === 1, 'Player registers collision with barrier');

// 4. Server-Side Score Validation & Anti-Cheat Tests
console.log('\n[4/4] Testing Server Score Validator & Anti-Cheat:');
const validRun = scoreValidator.validateSubmission({
  sessionId: 'test_sess_valid_' + Date.now(),
  userId: 'u_test',
  seed: 948271,
  mode: 'endless',
  score: 1200,
  durationSeconds: 45,
  maxCombo: 25,
  eventsCount: 30,
  checksum: 'abc',
});
assert(validRun.isValid === true && validRun.validatedScore === 1200, 'Legitimate score is accepted');

// Test Duplicate Replay Rejection
const dupSessionId = 'dup_sess_' + Date.now();
scoreValidator.validateSubmission({
  sessionId: dupSessionId,
  userId: 'u_test',
  seed: 948271,
  mode: 'endless',
  score: 500,
  durationSeconds: 30,
  maxCombo: 10,
  eventsCount: 15,
  checksum: 'abc',
});
const dupResult = scoreValidator.validateSubmission({
  sessionId: dupSessionId,
  userId: 'u_test',
  seed: 948271,
  mode: 'endless',
  score: 500,
  durationSeconds: 30,
  maxCombo: 10,
  eventsCount: 15,
  checksum: 'abc',
});
assert(dupResult.isValid === false, 'Duplicate session submission rejected (anti-replay)');

// Test Impossible Rate Rejection
const cheatedRun = scoreValidator.validateSubmission({
  sessionId: 'cheat_sess_' + Date.now(),
  userId: 'u_hacker',
  seed: 1234,
  mode: 'endless',
  score: 50000,
  durationSeconds: 5,
  maxCombo: 5,
  eventsCount: 5,
  checksum: 'bad',
});
assert(
  cheatedRun.isValid === false && cheatedRun.reason?.includes('EXCESSIVE_RATE') === true,
  'Impossible score-rate ceiling properly rejected'
);

console.log('\n========================================');
const passedCount = results.filter((r) => r.passed).length;
console.log(`TEST SUMMARY: ${passedCount}/${results.length} PASSED`);
console.log('========================================\n');

if (passedCount !== results.length) {
  process.exit(1);
}
