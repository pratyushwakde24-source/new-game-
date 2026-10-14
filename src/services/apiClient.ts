import { ScoreSubmission } from '../types/index.ts';

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
}

export const apiClient = new ApiClient();
