import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://thbthpmvilxygauuvqqx.supabase.co';
const supabaseKey = 'sb_publishable_luG1klFohVLSKBnaOyD3qg_p6yi_533'; 

export const supabase = createClient(supabaseUrl, supabaseKey);