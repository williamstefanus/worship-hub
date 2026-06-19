import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project credentials
// You can find these in your Supabase project dashboard under Settings > API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

/**
 * Supabase client instance
 * Initialize once and reuse throughout the application
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Fetch all songs from the Supabase `songs` table
 * @returns {Promise<{data: Array, error: Object|null}>}
 */
export async function fetchSongs() {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('title', { ascending: true })

  return { data, error }
}

/**
 * Search songs by title (case-insensitive partial match)
 * @param {string} query - Search term
 * @returns {Promise<{data: Array, error: Object|null}>}
 */
export async function searchSongs(query) {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .ilike('title', `%${query}%`)
    .order('title', { ascending: true })

  return { data, error }
}
