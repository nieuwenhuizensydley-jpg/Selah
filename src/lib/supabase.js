import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ijtrgaypsuhluxouohfn.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_ErZD5NO0jaIRIL7v16_fPw_9sdOi2YK'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: window.localStorage,
    storageKey: 'selah-auth-token',
    flowType: 'implicit',
  }
})
