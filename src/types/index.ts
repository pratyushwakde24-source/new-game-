export * from './game.ts';

export interface UserProfile {
  id: string;
  email?: string;
  username: string;
  avatarSeed: string;
  isGuest: boolean;
  isSparkPlus: boolean;
  createdAt: string;
  role: 'player' | 'moderator' | 'admin';
}

export interface ScoreSubmission {
  sessionId: string;
  userId: string;
  username: string;
  mode: string;
  score: number;
  durationMs?: number;
  durationSeconds?: number;
  maxCombo: number;
  seed: number;
  eventsCount: number;
  checksum: string;
  validated: boolean;
  submittedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  mode: string;
  maxCombo: number;
  date: string;
  isPlus: boolean;
}

export interface MultiplayerRoom {
  id: string;
  code: string;
  hostId: string;
  maxPlayers: number;
  status: 'lobby' | 'countdown' | 'in_game' | 'results';
  seed: number;
  createdAt: string;
  players: {
    id: string;
    username: string;
    ready: boolean;
    score: number;
    health: number;
    isHost: boolean;
  }[];
}
