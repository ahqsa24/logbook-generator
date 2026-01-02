import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our comments
export interface Comment {
    id: string;
    name: string;
    comment: string;
    timestamp: string;
    likes: number;
    created_at?: string;
}

export interface Reply {
    id: string;
    comment_id: string;
    name: string;
    comment: string;
    timestamp: string;
    created_at?: string;
}
