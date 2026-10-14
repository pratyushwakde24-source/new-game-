export const SERVER_CONFIG = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'sparkverse_dev_secret_key_change_in_production',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  corsOrigins: ['*'],
  maxScorePerSecond: 250, // anti-cheat ceiling
  minRunDurationSeconds: 5,
};
