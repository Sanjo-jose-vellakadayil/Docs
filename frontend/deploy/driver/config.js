/* VandiPilot driver tool — Supabase connection (ON-24).
   Paste the values from Supabase → Project Settings → API.
   The anon key is meant to be public: the database rules in
   backend/supabase/schema.sql decide what each signed-in driver can see. */
export const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR-SUPABASE-ANON-KEY';

export const isConfigured = () =>
  !SUPABASE_URL.includes('YOUR-PROJECT-REF') && !SUPABASE_ANON_KEY.startsWith('YOUR-');
