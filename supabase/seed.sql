-- Default seed data for SPARKVERSE

-- Cosmetic items
INSERT INTO cosmetic_items (id, name, description, category, color, secondary_color, glow_color, cost, is_plus_only, rarity)
VALUES
  ('skin_nebula_cyan', 'Cyan Nebula', 'The standard celestial core blazing with electric cyan energy.', 'skin', '#06b6d4', '#3b82f6', '#67e8f9', 0, false, 'common'),
  ('skin_solar_flare', 'Solar Flare', 'Forged in the heart of a young star. Golden radiant corona.', 'skin', '#f59e0b', '#ef4444', '#fde047', 100, false, 'rare'),
  ('skin_void_violet', 'Void Violet', 'Deep cosmic singularity pulsing with dark amethyst light.', 'skin', '#8b5cf6', '#ec4899', '#d8b4fe', 250, false, 'epic'),
  ('skin_supernova_gold', 'Supernova Gold', 'Mythic hypergiant radiance for master cosmic navigators.', 'skin', '#ffd700', '#ffffff', '#fffbeb', 500, true, 'legendary'),
  ('trail_stardust', 'Stardust Trail', 'Sparkling trail of cosmic dust particles.', 'trail', '#38bdf8', NULL, NULL, 0, false, 'common'),
  ('trail_comet_blaze', 'Comet Blaze', 'Intense plasma tail that leaves lingering embers.', 'trail', '#f43f5e', NULL, NULL, 150, false, 'rare'),
  ('env_deep_space', 'Deep Cosmos', 'Midnight purple space studded with crystalline nebulae.', 'environment', '#080718', NULL, NULL, 0, false, 'common'),
  ('env_aurora_nebula', 'Aurora Expanse', 'Vibrant emerald and magenta cosmic auroras.', 'environment', '#061727', NULL, NULL, 300, true, 'epic')
ON CONFLICT (id) DO NOTHING;

-- Initial Achievements
INSERT INTO achievements (id, title, description, icon, max_progress, reward_xp, reward_coins)
VALUES
  ('ach_first_steps', 'Cosmic Ignition', 'Collect your first 10 energy sparks.', 'Sparkles', 10, 50, 25),
  ('ach_combo_master', 'Chain Reaction', 'Reach a 20x combo multiplier.', 'Zap', 20, 120, 60),
  ('ach_gate_pilot', 'Aperture Ace', 'Fly cleanly through 15 quantum gates.', 'ShieldCheck', 15, 200, 100),
  ('ach_high_flyer', 'Constellation Pioneer', 'Score over 2,000 points in a single run.', 'Trophy', 2000, 350, 150)
ON CONFLICT (id) DO NOTHING;

-- Feature Flags
INSERT INTO feature_flags (id, description, enabled, rollout_percentage)
VALUES
  ('MULTIPLAYER_ROOMS_ENABLED', 'Allows players to host and join real-time rooms', true, 100),
  ('DAILY_CHALLENGE_SYNC', 'Authoritative global seeded runs for all platforms', true, 100),
  ('SPARK_PLUS_CHECKOUT', 'Regional subscription checkout flow', true, 100),
  ('PBR_STUDIO_LIGHTING', 'Real-time reflections via RoomEnvironment', true, 100)
ON CONFLICT (id) DO NOTHING;
