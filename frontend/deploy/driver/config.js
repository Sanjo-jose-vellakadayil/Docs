/* VandiPilot driver tool — Supabase connection (ON-24).
   Paste the values from Supabase → Settings → API Keys (or the Connect button):
   - SUPABASE_URL: the project URL, https://<project-ref>.supabase.co
   - SUPABASE_ANON_KEY: the PUBLISHABLE key (sb_publishable_...). It is meant
     to be public; the database rules in backend/supabase/schema.sql decide
     what each signed-in driver can see. Never put a secret key here. */
export const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR-SUPABASE-PUBLISHABLE-KEY';

export const isConfigured = () =>
  !SUPABASE_URL.includes('YOUR-PROJECT-REF') && !SUPABASE_ANON_KEY.startsWith('YOUR-');
