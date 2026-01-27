import { createClient } from '@supabase/supabase-js';

// Optional: Initialize Supabase client for additional features
// This is only needed if you want to use Supabase's auth, storage, or real-time features
// For now, we're just using Supabase as a PostgreSQL database through Prisma

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Note: We're primarily using Prisma for database operations
// This Supabase client is here for future enhancements like:
// - Real-time updates
// - Authentication
// - File storage for resume uploads
// - Direct database queries if needed