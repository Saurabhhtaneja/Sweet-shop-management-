import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Sweet {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  is_admin: boolean;
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  sweet_id: string;
  quantity: number;
  total_price: number;
  created_at: string;
}
