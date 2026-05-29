import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;

// Lecture publique (routes API Netlify)
// Fallback sur SERVICE_KEY si ANON_KEY absent (contexte scripts CI)
export const supabase = createClient(
  url,
  (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY)!,
);

// Écriture privilegiée (scripts GitHub Actions uniquement)
export const supabaseAdmin = createClient(
  url,
  process.env.SUPABASE_SERVICE_KEY!,
);
