export interface ScoringRuleConfig {
  standardSparkPoints: number;
  specialSparkPoints: number;
  magnetSparkPoints: number;
  gatePassPoints: number;
  patternCompletePoints: number;
  distanceMultiplier: number;
  comboTiers: { threshold: number; multiplier: number }[];
  maxMultiplier: number;
  comboTimeoutSeconds: number;
}

export const DEFAULT_SCORING_CONFIG: ScoringRuleConfig = {
  standardSparkPoints: 10,
  specialSparkPoints: 25,
  magnetSparkPoints: 15,
  gatePassPoints: 50,
  patternCompletePoints: 100,
  distanceMultiplier: 1.0,
  comboTiers: [
    { threshold: 0, multiplier: 1.0 },
    { threshold: 5, multiplier: 1.5 },
    { threshold: 10, multiplier: 2.0 },
    { threshold: 20, multiplier: 2.5 },
    { threshold: 35, multiplier: 3.0 },
    { threshold: 50, multiplier: 4.0 },
    { threshold: 75, multiplier: 5.0 },
  ],
  maxMultiplier: 5.0,
  comboTimeoutSeconds: 2.5,
};

export function calculateMultiplier(combo: number, config = DEFAULT_SCORING_CONFIG): number {
  let mult = 1.0;
  for (const tier of config.comboTiers) {
    if (combo >= tier.threshold) {
      mult = tier.multiplier;
    }
  }
  return Math.min(mult, config.maxMultiplier);
}
