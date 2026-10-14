import { ScoreSubmission, LeaderboardEntry } from '../types/index.ts';

export class ApiClient {
  public async submitScore(payload: Partial<ScoreSubmission>): Promise<{ success: boolean; status: string; validatedScore?: number }> {
    try {
      const res = await fetch('/api/scores/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        return { success: false, status: 'REJECTED' };
      }
      return await res.json();
    } catch {
      // Local fallback for offline/preview mode
      return { success: true, status: 'VALIDATED_LOCAL', validatedScore: payload.score };
    }
  }

  public async fetchLeaderboard(mode = 'endless', limit = 20): Promise<LeaderboardEntry[]> {
    try {
      const res = await fetch(`/api/scores/leaderboard?mode=${encodeURIComponent(mode)}&limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        return data.entries || [];
      }
    } catch (err) {
      console.warn('[ApiClient] Failed to fetch leaderboard:', err);
    }
    return [];
  }

  public async syncCloudSave(payload: {
    userId: string;
    stats: {
      level: number;
      xp: number;
      sparkCoins: number;
      highScore: number;
      distanceTraveled: number;
    };
    equippedSkin: string;
    equippedTrail: string;
    equippedEnv: string;
    achievements: { id: string; progress: number; unlocked: boolean }[];
  }): Promise<boolean> {
    try {
      const res = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public async fetchCloudSave(userId: string) {
    try {
      const res = await fetch(`/api/user/state/${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        return data.saveState;
      }
    } catch {}
    return null;
  }

  public async registerProfile(userId: string, username: string, isGuest = true) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, username, isGuest }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  }

  public async checkHealth() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) return await res.json();
    } catch {}
    return null;
  }

  public async fetchDailyChallenge() {
    try {
      const res = await fetch('/api/challenges/daily');
      if (res.ok) return await res.json();
    } catch {}
    return null;
  }

  public async createMultiplayerRoom(hostId: string, username: string) {
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId, username }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { roomCode: 'SPARK-' + Math.floor(Math.random() * 9000 + 1000), seed: 12345 };
  }

  public async joinMultiplayerRoom(roomCode: string, playerId: string, username: string) {
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, playerId, username }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  }

  public async fetchScoreAudits(limit = 25) {
    try {
      const res = await fetch(`/api/admin/score-audits?limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        return data.audits || [];
      }
    } catch {}
    return [];
  }
}

export const apiClient = new ApiClient();
