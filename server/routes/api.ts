import { Router, Request, Response } from 'express';
import { scoreValidator } from '../game-validation/scoreValidator.ts';
import { roomManager } from '../multiplayer/roomManager.ts';
import { paymentService } from '../payments/paymentService.ts';
import { supabaseService } from '../services/supabaseService.ts';

export const apiRouter = Router();

// 1. Health & Database Connectivity Check
apiRouter.get('/health', (_req: Request, res: Response) => {
  const dbStatus = supabaseService.getStatus();
  res.json({
    status: 'online',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: {
      provider: 'Supabase PostgreSQL',
      connected: dbStatus.connected,
      urlConfigured: dbStatus.urlConfigured,
      serviceRoleConfigured: dbStatus.serviceRoleConfigured,
    },
    services: {
      scoreValidation: 'active',
      rooms: 'active',
      payments: 'active',
    },
  });
});

// 2. Score submission with server-side anti-cheat validation
apiRouter.post('/scores/submit', async (req: Request, res: Response) => {
  try {
    const { sessionId, userId, username, seed, mode, score, durationSeconds, maxCombo, distance, eventsCount, checksum } = req.body;

    if (!sessionId || typeof score !== 'number') {
      res.status(400).json({ error: 'Missing required submission fields' });
      return;
    }

    const outcome = scoreValidator.validateSubmission({
      sessionId,
      userId: userId || 'guest',
      seed: seed || 0,
      mode: mode || 'endless',
      score,
      durationSeconds: durationSeconds || 10,
      maxCombo: maxCombo || 0,
      eventsCount: eventsCount || 0,
      checksum: checksum || 'none',
    });

    if (!outcome.isValid) {
      await supabaseService.recordScoreSubmission({
        sessionId,
        userId: userId || 'guest',
        username: username || 'Player',
        mode: mode || 'endless',
        seed: seed || 0,
        claimedScore: score,
        validatedScore: 0,
        maxCombo: maxCombo || 0,
        distance: distance || 0,
        validationStatus: 'REJECTED',
        rejectionReason: outcome.reason,
      });

      res.status(422).json({
        success: false,
        error: outcome.reason,
        status: 'REJECTED',
      });
      return;
    }

    // Persist legitimate submission in database
    const saved = await supabaseService.recordScoreSubmission({
      sessionId,
      userId: userId || 'guest',
      username: username || 'Player',
      mode: mode || 'endless',
      seed: seed || 0,
      claimedScore: score,
      validatedScore: outcome.validatedScore,
      maxCombo: maxCombo || 0,
      distance: distance || 0,
      validationStatus: 'VALIDATED',
    });

    res.json({
      success: true,
      status: 'VALIDATED',
      validatedScore: outcome.validatedScore,
      submissionId: saved.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal validation error';
    res.status(500).json({ error: message });
  }
});

// 3. Real Validated Leaderboard
apiRouter.get('/scores/leaderboard', async (req: Request, res: Response) => {
  try {
    const mode = (req.query.mode as string) || 'endless';
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const entries = await supabaseService.getLeaderboard(mode, limit);
    res.json({ mode, entries });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve leaderboard';
    res.status(500).json({ error: message });
  }
});

// 4. Cloud Save Synchronization
apiRouter.post('/user/sync', async (req: Request, res: Response) => {
  try {
    const { userId, stats, equippedSkin, equippedTrail, equippedEnv, achievements } = req.body;
    if (!userId || !stats) {
      res.status(400).json({ error: 'Missing userId or stats payload' });
      return;
    }

    const saved = await supabaseService.saveCloudState(userId, {
      stats: {
        level: stats.level || 1,
        xp: stats.xp || 0,
        sparkCoins: stats.sparkCoins || 0,
        highScore: stats.highScore || 0,
        distanceTraveled: stats.distanceTraveled || 0,
      },
      equippedSkin: equippedSkin || 'skin_nebula_cyan',
      equippedTrail: equippedTrail || 'trail_stardust',
      equippedEnv: equippedEnv || 'env_deep_space',
      achievements: achievements || [],
    });

    res.json({ success: true, cloudSave: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Cloud sync error';
    res.status(500).json({ error: message });
  }
});

// 5. Cloud Save Retrieval
apiRouter.get('/user/state/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const saveState = await supabaseService.getCloudState(userId);
    res.json({ found: Boolean(saveState), saveState });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve state';
    res.status(500).json({ error: message });
  }
});

// 6. User Profile Creation / Retrieval
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { userId, username, isGuest } = req.body;
    const profile = await supabaseService.getOrCreateProfile(
      userId || 'guest_' + Math.random().toString(36).substring(2, 9),
      username || 'SparkTraveler',
      isGuest !== false
    );
    res.json({ success: true, profile });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Profile creation error';
    res.status(500).json({ error: message });
  }
});

// 7. Daily challenge endpoint
apiRouter.get('/challenges/daily', (_req: Request, res: Response) => {
  const today = new Date().toISOString().slice(0, 10);
  res.json({
    id: `daily_${today}`,
    date: today,
    title: 'Hyperdrive Orbit',
    description: 'Double gate frequency with high speed multiplier.',
    seed: 948271,
    targetScore: 1500,
    modifier: '2x Gate Frequency',
    multiplierBonus: 1.5,
  });
});

// 8. Multiplayer Room creation & join
apiRouter.post('/rooms/create', (req: Request, res: Response) => {
  const { hostId, username, mode } = req.body;
  const room = roomManager.createRoom(hostId || 'guest_host', username || 'HostRanger', mode);
  res.json({
    roomCode: room.code,
    seed: room.seed,
    status: room.status,
  });
});

apiRouter.post('/rooms/join', (req: Request, res: Response) => {
  const { roomCode, playerId, username } = req.body;
  const room = roomManager.joinRoom(roomCode, playerId || 'guest_player', username || 'Challenger');
  if (!room) {
    res.status(404).json({ error: 'Room not found or is full' });
    return;
  }
  res.json({
    roomCode: room.code,
    seed: room.seed,
    status: room.status,
    playerCount: room.players.size,
  });
});

// 9. Pricing endpoint
apiRouter.get('/pricing', (req: Request, res: Response) => {
  const region = (req.query.region as string) || 'US';
  const plans = paymentService.getPricingForRegion(region);
  res.json({ region, plans });
});

// 10. Admin Score Submissions Audit Log (Real telemetry from database)
apiRouter.get('/admin/score-audits', async (req: Request, res: Response) => {
  try {
    const limit = parseInt((req.query.limit as string) || '25', 10);
    const audits = await supabaseService.getScoreAudits(limit);
    res.json({ audits });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve audits';
    res.status(500).json({ error: message });
  }
});

// 11. Room lookup endpoint
apiRouter.get('/rooms/:roomCode', (req: Request, res: Response) => {
  const room = roomManager.getRoom(req.params.roomCode.toUpperCase());
  if (!room) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }
  res.json({
    roomCode: room.code,
    seed: room.seed,
    mode: room.mode,
    status: room.status,
    playerCount: room.players.size,
  });
});
