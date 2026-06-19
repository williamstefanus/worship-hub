import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Supabase client instance — initialized once and reused throughout the app
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─── Songs ───────────────────────────────────────────────────────────────────

/** Fetch all songs ordered by title */
export async function fetchSongs() {
  return supabase.from('songs').select('*').order('title', { ascending: true })
}

/** Insert a new song row */
export async function insertSong(songData) {
  return supabase.from('songs').insert([songData]).select().single()
}

/** Update an existing song row */
export async function updateSong(id, updates) {
  return supabase.from('songs').update(updates).eq('id', id).select().single()
}

/** Delete a song row */
export async function deleteSong(id) {
  return supabase.from('songs').delete().eq('id', id)
}

// ─── Storage ─────────────────────────────────────────────────────────────────

/**
 * Upload an audio file to the 'audio' bucket
 * @param {File} file
 * @param {string} songId - used as filename prefix for uniqueness
 * @returns {Promise<{publicUrl: string|null, error: any}>}
 */
export async function uploadAudio(file, songId) {
  const ext = file.name.split('.').pop()
  const path = `${songId}-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('audio')
    .upload(path, file, { upsert: true })

  if (uploadError) return { publicUrl: null, error: uploadError }

  const { data } = supabase.storage.from('audio').getPublicUrl(path)
  return { publicUrl: data.publicUrl, error: null }
}

/**
 * Upload a chord chart PDF to the 'chord-charts' bucket
 * @param {File} file
 * @param {string} songId
 * @returns {Promise<{publicUrl: string|null, error: any}>}
 */
export async function uploadChordChart(file, songId) {
  const ext = file.name.split('.').pop()
  const path = `${songId}-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('chord-charts')
    .upload(path, file, { upsert: true })

  if (uploadError) return { publicUrl: null, error: uploadError }

  const { data } = supabase.storage.from('chord-charts').getPublicUrl(path)
  return { publicUrl: data.publicUrl, error: null }
}
