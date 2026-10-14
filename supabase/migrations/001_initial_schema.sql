-- ==============================================================================
-- SPARKVERSE PRODUCTION DATABASE SCHEMA
-- Migration: 001_initial_schema.sql
-- Description: Complete relational schema with RLS and high-performance indexes
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE,
  username VARCHAR(40) UNIQUE NOT NULL,
  display_name VARCHAR(60),
  avatar_url TEXT,
  is_guest BOOLEAN DEFAULT true,
  role VARCHAR(20) DEFAULT 'player' CHECK (role IN ('player', 'moderator', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PLAYER SETTINGS
CREATE TABLE IF NOT EXISTS player_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  master_volume NUMERIC(3,2) DEFAULT 0.8,
  sfx_volume NUMERIC(3,2) DEFAULT 0.7,
  music_volume NUMERIC(3,2) DEFAULT 0.4,
  graphics_quality VARCHAR(20) DEFAULT 'high',
  reduced_motion BOOLEAN DEFAULT false,
  high_contrast BOOLEAN DEFAULT false,
  colorblind_mode VARCHAR(20) DEFAULT 'none',
  screen_shake BOOLEAN DEFAULT true,
  haptics BOOLEAN DEFAULT true,
  control_sensitivity NUMERIC(3,2) DEFAULT 1.0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PLAYER STATISTICS
CREATE TABLE IF NOT EXISTS player_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  total_runs INT DEFAULT 0,
  total_score BIGINT DEFAULT 0,
  highest_score INT DEFAULT 0,
  highest_combo INT DEFAULT 0,
  total_distance INT DEFAULT 0,
  total_sparks_collected INT DEFAULT 0,
  total_gates_cleared INT DEFAULT 0,
  total_playtime_seconds INT DEFAULT 0,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  spark_coins INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GAME SESSIONS
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  mode VARCHAR(30) NOT NULL,
  seed BIGINT NOT NULL,
  game_version VARCHAR(20) NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds NUMERIC(8,2),
  completed BOOLEAN DEFAULT false
);

-- 5. SCORE SUBMISSIONS (Server-Authoritative Validation)
CREATE TABLE IF NOT EXISTS score_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mode VARCHAR(30) NOT NULL,
  seed BIGINT NOT NULL,
  claimed_score INT NOT NULL,
  validated_score INT,
  max_combo INT NOT NULL,
  distance INT NOT NULL,
  events_checksum TEXT NOT NULL,
  validation_status VARCHAR(30) DEFAULT 'PENDING' CHECK (validation_status IN ('PENDING', 'VALIDATED', 'REJECTED')),
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DAILY CHALLENGES
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_date DATE UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  seed BIGINT NOT NULL,
  target_score INT NOT NULL,
  modifier_rules JSONB DEFAULT '{}'::jsonb,
  multiplier_bonus NUMERIC(3,2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CHALLENGE ATTEMPTS
CREATE TABLE IF NOT EXISTS challenge_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score INT NOT NULL,
  completed BOOLEAN DEFAULT false,
  attempt_timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS achievements (
  id VARCHAR(60) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  max_progress INT NOT NULL,
  reward_xp INT DEFAULT 0,
  reward_coins INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PLAYER ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS player_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id VARCHAR(60) REFERENCES achievements(id) ON DELETE CASCADE,
  current_progress INT DEFAULT 0,
  unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  UNIQUE(profile_id, achievement_id)
);

-- 10. MISSIONS
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  category VARCHAR(30) DEFAULT 'daily',
  target_count INT NOT NULL,
  reward_xp INT NOT NULL,
  reward_coins INT NOT NULL,
  active_date DATE DEFAULT CURRENT_DATE
);

-- 11. MISSION PROGRESS
CREATE TABLE IF NOT EXISTS mission_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  progress INT DEFAULT 0,
  claimed BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. COSMETIC ITEMS
CREATE TABLE IF NOT EXISTS cosmetic_items (
  id VARCHAR(60) PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  description TEXT,
  category VARCHAR(30) NOT NULL CHECK (category IN ('skin', 'trail', 'environment', 'soundpack')),
  color VARCHAR(20) NOT NULL,
  secondary_color VARCHAR(20),
  glow_color VARCHAR(20),
  cost INT DEFAULT 0,
  is_plus_only BOOLEAN DEFAULT false,
  rarity VARCHAR(20) DEFAULT 'common',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. PLAYER INVENTORY
CREATE TABLE IF NOT EXISTS player_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_id VARCHAR(60) REFERENCES cosmetic_items(id) ON DELETE CASCADE,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, item_id)
);

-- 14. PLAYER EQUIPMENT
CREATE TABLE IF NOT EXISTS player_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  skin_id VARCHAR(60) REFERENCES cosmetic_items(id),
  trail_id VARCHAR(60) REFERENCES cosmetic_items(id),
  environment_id VARCHAR(60) REFERENCES cosmetic_items(id),
  soundpack_id VARCHAR(60) REFERENCES cosmetic_items(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. FRIENDS
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_b UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_a, user_b)
);

-- 16. FRIEND REQUESTS
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. MULTIPLAYER ROOMS
CREATE TABLE IF NOT EXISTS multiplayer_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_code VARCHAR(12) UNIQUE NOT NULL,
  host_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  seed BIGINT NOT NULL,
  status VARCHAR(20) DEFAULT 'lobby' CHECK (status IN ('lobby', 'countdown', 'in_game', 'results')),
  max_players INT DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. MULTIPLAYER PARTICIPANTS
CREATE TABLE IF NOT EXISTS multiplayer_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES multiplayer_rooms(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_ready BOOLEAN DEFAULT false,
  final_score INT DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, profile_id)
);

-- 19. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) DEFAULT 'spark_plus_monthly',
  status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  provider VARCHAR(30) DEFAULT 'stripe',
  external_subscription_id VARCHAR(100),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. PAYMENT EVENTS
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id VARCHAR(120) UNIQUE NOT NULL,
  provider VARCHAR(30) NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. FEATURE FLAGS
CREATE TABLE IF NOT EXISTS feature_flags (
  id VARCHAR(60) PRIMARY KEY,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  rollout_percentage INT DEFAULT 100,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_resource VARCHAR(100),
  details JSONB,
  ip_address VARCHAR(50),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR HIGH-THROUGHPUT LEADERBOARDS & LOOKUPS
CREATE INDEX IF NOT EXISTS idx_score_submissions_score ON score_submissions (claimed_score DESC) WHERE validation_status = 'VALIDATED';
CREATE INDEX IF NOT EXISTS idx_score_submissions_mode ON score_submissions (mode, claimed_score DESC);
CREATE INDEX IF NOT EXISTS idx_player_stats_highest ON player_statistics (highest_score DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_profile ON game_sessions (profile_id);
CREATE INDEX IF NOT EXISTS idx_multiplayer_rooms_code ON multiplayer_rooms (room_code);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_submissions ENABLE ROW LEVEL SECURITY;

-- Sample RLS: Users can read public profiles and edit their own profile
CREATE POLICY "Public profiles are readable by all" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
