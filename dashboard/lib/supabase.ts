
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || ''; // Anon Key is fine for reading public data if RLS allowed, or Service Role for backend

export const supabase = createClient(supabaseUrl, supabaseKey);
