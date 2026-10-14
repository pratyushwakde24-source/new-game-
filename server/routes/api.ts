import { Router, Request, Response } from 'express';
import { scoreValidator } from '../game-validation/scoreValidator.ts';
import { roomManager } from '../multiplayer/roomManager.ts';
import { paymentService } from '../payments/paymentService.ts';

export const apiRouter = Router();

// Health check
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      scoreValidation: 'active',
      rooms: 'active',
      payments: 'active',
    },
  });
});

// Score submission with server-side anti-cheat validation
apiRouter.post('/scores/submit', (req: Request, res: Response) => {
  try {
    const { sessionId, userId, seed, mode, score, durationSeconds, maxCombo, eventsCount, checksum } = req.body;
    
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
      res.status(422).json({
        success: false,
        error: outcome.reason,
        status: 'REJECTED',
      });
      return;
    }

    res.json({
      success: true,
      status: 'VALIDATED',
      validatedScore: outcome.validatedScore,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal validation error';
    res.status(500).json({ error: message });
  }
});

// Daily challenge endpoint
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

// Multiplayer Room creation
apiRouter.post('/rooms/create', (req: Request, res: Response) => {
  const { hostId, username, mode } = req.body;
  const room = roomManager.createRoom(hostId || 'guest_host', username || 'HostRanger', mode);
  res.json({
    roomCode: room.code,
    seed: room.seed,
    status: room.status,
  });
});

// Multiplayer Room join
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

// Pricing endpoint
apiRouter.get('/pricing', (req: Request, res: Response) => {
  const region = (req.query.region as string) || 'US';
  const plans = paymentService.getPricingForRegion(region);
  res.json({ region, plans });
});
