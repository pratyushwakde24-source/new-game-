import { SERVER_CONFIG } from '../config/index.ts';

export interface ScoreValidationPayload {
  sessionId: string;
  userId: string;
  seed: number;
  mode: string;
  score: number;
  durationSeconds: number;
  maxCombo: number;
  eventsCount: number;
  checksum: string;
}

export interface ValidationOutcome {
  isValid: boolean;
  validatedScore: number;
  reason?: string;
}

export class ScoreValidator {
  private processedSessions = new Set<string>();

  public validateSubmission(payload: ScoreValidationPayload): ValidationOutcome {
    // 1. Idempotency Check: Prevent duplicate replay submissions
    if (this.processedSessions.has(payload.sessionId)) {
      return {
        isValid: false,
        validatedScore: 0,
        reason: 'DUPLICATE_SUBMISSION: Session ID already processed',
      };
    }

    // 2. Minimum Duration Check
    if (payload.durationSeconds < SERVER_CONFIG.minRunDurationSeconds && payload.score > 100) {
      return {
        isValid: false,
        validatedScore: 0,
        reason: 'DURATION_ANOMALY: Impossible run completion time',
      };
    }

    // 3. Score Rate Ceiling Check
    const rate = payload.score / Math.max(1, payload.durationSeconds);
    if (rate > SERVER_CONFIG.maxScorePerSecond) {
      return {
        isValid: false,
        validatedScore: 0,
        reason: `EXCESSIVE_RATE: Scored ${rate.toFixed(1)} pts/sec, exceeds max plausible ceiling of ${SERVER_CONFIG.maxScorePerSecond}`,
      };
    }

    // 4. Combo Plausibility
    if (payload.maxCombo > 150) {
      return {
        isValid: false,
        validatedScore: 0,
        reason: 'COMBO_ANOMALY: Max combo exceeds track physical capacity',
      };
    }

    // Record session as processed
    this.processedSessions.add(payload.sessionId);

    return {
      isValid: true,
      validatedScore: payload.score,
    };
  }
}

export const scoreValidator = new ScoreValidator();
