import { createClient } from '@supabase/supabase-js';

// User provided credentials
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ljxfducrmevaxvzykasm.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY || 'sb_publishable_lMoLI7EBg5ymUOteNiIKgA_geb75o-w';

const isDefaultKey = !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('sb_publishable_lMoLI7EBg5ymUOteNiIKgA_geb75o-w');

export const supabase = (SUPABASE_URL && !isDefaultKey)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const isSupabaseConfigured = () => !!supabase;