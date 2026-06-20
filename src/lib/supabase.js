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
  return supabase.from('songs').select('*, artists(name)').order('title', { ascending: true })
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

// ─── Sunday Setlist ───────────────────────────────────────────────────────────

/**
 * Fetch the single sunday_setlist row (id = 1).
 * Returns { data, error } — data may be null if the row doesn't exist yet.
 */
export async function fetchSetlist() {
  const { data, error } = await supabase
    .from('sunday_setlist')
    .select('*')
    .eq('id', 1)
    .maybeSingle()
  return { data, error }
}

/**
 * Upsert the sunday_setlist row (admin only).
 * @param {string[]} songIds - ordered array of song UUIDs
 * @param {string}   label   - e.g. "June 22 Service"
 * @param {string}   sundayDate - ISO date string e.g. "2026-06-22"
 */
export async function updateSetlist(songIds, label, sundayDate) {
  return supabase
    .from('sunday_setlist')
    .upsert({
      id: 1,
      song_ids: songIds,
      label,
      sunday_date: sundayDate,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
}

/**
 * Clear the sunday_setlist (reset to empty song list).
 * Keeps the row but empties song_ids so the banner disappears.
 */
export async function clearSetlist() {
  return supabase
    .from('sunday_setlist')
    .upsert({
      id: 1,
      song_ids: [],
      label: 'Sunday Service',
      sunday_date: new Date().toISOString().slice(0, 10),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
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

// ─── Artists ─────────────────────────────────────────────────────────────────

/** Fetch all artists ordered by name */
export async function fetchArtists() {
  return supabase.from('artists').select('*').order('name', { ascending: true })
}

/** Insert a new artist */
export async function insertArtist(artistData) {
  return supabase.from('artists').insert([artistData]).select().single()
}

/** Update an existing artist */
export async function updateArtist(id, updates) {
  return supabase.from('artists').update(updates).eq('id', id).select().single()
}

/** Delete an artist */
export async function deleteArtist(id) {
  return supabase.from('artists').delete().eq('id', id)
}
