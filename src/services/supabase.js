// Smart Light PWA — Supabase Client Initialization
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../config.js';

/**
 * Supabase client singleton
 * Dùng chung cho toàn bộ app: Realtime, REST queries, CRUD
 */
export const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
