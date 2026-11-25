import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Service-role client: bypasses RLS. Only ever used on the server, after authorization checks.
export const supabase = createClient(env.supabaseUrl, env.serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
