<template>
  <div class="admin-wrapper">

    <!-- ── Header ─────────────────────────────────────────────────── -->
    <header class="admin-header glass">
      <div class="admin-header__brand">
        <span class="logo-icon">🎵</span>
        <span class="logo-text">Worship <span class="gradient-text">Hub</span></span>
        <span class="admin-badge">Admin</span>
      </div>
      <div class="admin-header__actions">
        <RouterLink to="/" class="btn-ghost">← Song Library</RouterLink>
        <button id="admin-signout" class="btn-ghost btn-danger" @click="handleSignOut">Sign Out</button>
      </div>
    </header>

    <main class="admin-main">

      <!-- ── Song Management Table ─────────────────────────────────── -->
      <section class="admin-section glass">
        <div class="section-header">
          <h2 class="section-title"><span class="section-icon">🎶</span> Song Library</h2>
          <div class="section-header__actions">
            <button id="open-add-song" class="btn-primary btn-sm-primary" @click="openAddModal">➕ Add Song</button>
            <button class="btn-ghost btn-sm" @click="loadSongs">↻ Refresh</button>
          </div>
        </div>

        <div v-if="loadingTable" class="table-loading">Loading songs…</div>

        <div v-else-if="songs.length === 0" class="table-empty">
          No songs yet. Click <strong>➕ Add Song</strong> to get started!
        </div>

        <div v-else class="table-wrapper">
          <table class="song-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Key</th>
                <th>BPM</th>
                <th>Audio</th>
                <th>Chords</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="song in songs" :key="song.id" class="song-row">
                <td class="song-title">{{ song.title }}</td>
                <td><span class="badge badge--key">{{ song.key }}</span></td>
                <td><span class="badge badge--bpm">{{ song.bpm }}</span></td>
                <td>
                  <span v-if="song.audio_url" class="status status--ok" title="Audio uploaded">✅</span>
                  <span v-else class="status status--missing" title="No audio">—</span>
                </td>
                <td>
                  <span v-if="song.pdf_url" class="status status--ok" title="Chords uploaded">✅</span>
                  <span v-else class="status status--missing" title="No chords">—</span>
                </td>
                <td class="actions-cell">
                  <button class="btn-icon btn-edit" title="Edit song"
                    @click="openEdit(song)">✏️</button>
                  <button class="btn-icon btn-danger" title="Delete song"
                    @click="confirmDelete(song)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <!-- ── Delete Confirm Modal ────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
        <div class="modal glass">
          <h3 class="modal-title">Delete Song?</h3>
          <p class="modal-body">
            Are you sure you want to delete <strong>{{ deleteTarget?.title }}</strong>?
            This cannot be undone.
          </p>
          <div class="modal-actions">
            <button class="btn-ghost" @click="deleteTarget = null">Cancel</button>
            <button class="btn-primary btn-danger" @click="handleDelete" :disabled="deleting">
              <span v-if="deleting" class="spinner"></span>
              {{ deleting ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Edit Song Modal ──────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="editTarget" class="modal-overlay" @click.self="editTarget = null">
        <div class="modal modal--wide glass">
          <h3 class="modal-title">✏️ Edit Song</h3>

          <form class="song-form" @submit.prevent="handleEditSong">
            <div class="form-grid">
              <!-- Title -->
              <div class="field-group field-group--full">
                <label class="field-label" for="e-title">Song Title *</label>
                <input id="e-title" v-model="editForm.title" class="field-input" type="text" required />
              </div>

              <!-- Key -->
              <div class="field-group">
                <label class="field-label" for="e-key">Key *</label>
                <select id="e-key" v-model="editForm.key" class="field-input" required>
                  <option value="" disabled>Select key…</option>
                  <option v-for="k in musicalKeys" :key="k" :value="k">{{ k }}</option>
                </select>
              </div>

              <!-- BPM -->
              <div class="field-group">
                <label class="field-label" for="e-bpm">BPM *</label>
                <input id="e-bpm" v-model.number="editForm.bpm" class="field-input" type="number" min="40" max="220" required />
              </div>

              <!-- Tags -->
              <div class="field-group field-group--full">
                <label class="field-label" for="e-tags">Tags <span class="field-hint">(comma separated)</span></label>
                <input id="e-tags" v-model="editForm.tags" class="field-input" type="text" />
              </div>

              <!-- Replace Audio -->
              <div class="field-group">
                <label class="field-label">Replace Audio <span class="field-hint">(optional)</span></label>
                <div
                  class="dropzone"
                  :class="{ 'dropzone--active': editDragOver.audio, 'dropzone--filled': editAudioFile }"
                  @dragover.prevent="editDragOver.audio = true"
                  @dragleave="editDragOver.audio = false"
                  @drop.prevent="e => editAudioFile = e.dataTransfer.files[0] ?? null"
                  @click="$refs.editAudioInput.click()"
                >
                  <input ref="editAudioInput" type="file" accept="audio/*" class="file-hidden"
                    @change="e => editAudioFile = e.target.files[0] ?? null" />
                  <div v-if="!editAudioFile" class="dropzone__prompt">
                    <span class="dropzone__icon">🎵</span>
                    <span>{{ editTarget?.audio_url ? 'Replace MP3' : 'Upload MP3' }}</span>
                  </div>
                  <div v-else class="dropzone__preview">
                    <span class="dropzone__icon">✅</span>
                    <span class="dropzone__filename">{{ editAudioFile.name }}</span>
                    <button type="button" class="dropzone__clear" @click.stop="editAudioFile = null">✕</button>
                  </div>
                </div>
              </div>

              <!-- Replace PDF -->
              <div class="field-group">
                <label class="field-label">Replace Chord Chart <span class="field-hint">(optional)</span></label>
                <div
                  class="dropzone"
                  :class="{ 'dropzone--active': editDragOver.pdf, 'dropzone--filled': editPdfFile }"
                  @dragover.prevent="editDragOver.pdf = true"
                  @dragleave="editDragOver.pdf = false"
                  @drop.prevent="e => editPdfFile = e.dataTransfer.files[0] ?? null"
                  @click="$refs.editPdfInput.click()"
                >
                  <input ref="editPdfInput" type="file" accept="application/pdf" class="file-hidden"
                    @change="e => editPdfFile = e.target.files[0] ?? null" />
                  <div v-if="!editPdfFile" class="dropzone__prompt">
                    <span class="dropzone__icon">📄</span>
                    <span>{{ editTarget?.pdf_url ? 'Replace PDF' : 'Upload PDF' }}</span>
                  </div>
                  <div v-else class="dropzone__preview">
                    <span class="dropzone__icon">✅</span>
                    <span class="dropzone__filename">{{ editPdfFile.name }}</span>
                    <button type="button" class="dropzone__clear" @click.stop="editPdfFile = null">✕</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Error -->
            <Transition name="fade">
              <div v-if="editError" class="alert alert--error">⚠️ {{ editError }}</div>
            </Transition>

            <div class="modal-actions modal-actions--form">
              <button type="button" class="btn-ghost" @click="editTarget = null">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="editSaving">
                <span v-if="editSaving" class="spinner"></span>
                {{ editSaving ? 'Saving…' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- ── Add Song Modal ────────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
        <div class="modal modal--wide glass">
          <h3 class="modal-title">➕ Add New Song</h3>

          <form id="add-song-form" class="song-form" @submit.prevent="handleAddSong">
            <div class="form-grid">
              <!-- Title -->
              <div class="field-group field-group--full">
                <label class="field-label" for="f-title">Song Title *</label>
                <input id="f-title" v-model="form.title" class="field-input" type="text"
                  placeholder="e.g. Way Maker" required />
              </div>

              <!-- Key -->
              <div class="field-group">
                <label class="field-label" for="f-key">Key *</label>
                <select id="f-key" v-model="form.key" class="field-input" required>
                  <option value="" disabled>Select key…</option>
                  <option v-for="k in musicalKeys" :key="k" :value="k">{{ k }}</option>
                </select>
              </div>

              <!-- BPM -->
              <div class="field-group">
                <label class="field-label" for="f-bpm">BPM *</label>
                <input id="f-bpm" v-model.number="form.bpm" class="field-input" type="number"
                  min="40" max="220" placeholder="e.g. 72" required />
              </div>

              <!-- Tags -->
              <div class="field-group field-group--full">
                <label class="field-label" for="f-tags">Tags <span class="field-hint">(comma separated)</span></label>
                <input id="f-tags" v-model="form.tags" class="field-input" type="text"
                  placeholder="e.g. Contemporary, Hillsong, Worship" />
              </div>

              <!-- Audio Upload -->
              <div class="field-group">
                <label class="field-label">Audio Guide Track (MP3)</label>
                <div
                  class="dropzone"
                  :class="{ 'dropzone--active': dragOver.audio, 'dropzone--filled': audioFile }"
                  @dragover.prevent="dragOver.audio = true"
                  @dragleave="dragOver.audio = false"
                  @drop.prevent="onDropAudio"
                  @click="$refs.audioInput.click()"
                >
                  <input ref="audioInput" type="file" accept="audio/*" class="file-hidden"
                    @change="onPickAudio" />
                  <div v-if="!audioFile" class="dropzone__prompt">
                    <span class="dropzone__icon">🎵</span>
                    <span>Drop MP3 here or <u>browse</u></span>
                  </div>
                  <div v-else class="dropzone__preview">
                    <span class="dropzone__icon">✅</span>
                    <span class="dropzone__filename">{{ audioFile.name }}</span>
                    <button type="button" class="dropzone__clear" @click.stop="audioFile = null">✕</button>
                  </div>
                </div>
                <div v-if="progress.audio > 0 && progress.audio < 100" class="progress-bar">
                  <div class="progress-bar__fill" :style="{ width: progress.audio + '%' }"></div>
                </div>
              </div>

              <!-- PDF Upload -->
              <div class="field-group">
                <label class="field-label">Music Notes / Chord Chart (PDF)</label>
                <div
                  class="dropzone"
                  :class="{ 'dropzone--active': dragOver.pdf, 'dropzone--filled': pdfFile }"
                  @dragover.prevent="dragOver.pdf = true"
                  @dragleave="dragOver.pdf = false"
                  @drop.prevent="onDropPdf"
                  @click="$refs.pdfInput.click()"
                >
                  <input ref="pdfInput" type="file" accept="application/pdf" class="file-hidden"
                    @change="onPickPdf" />
                  <div v-if="!pdfFile" class="dropzone__prompt">
                    <span class="dropzone__icon">📄</span>
                    <span>Drop PDF here or <u>browse</u></span>
                  </div>
                  <div v-else class="dropzone__preview">
                    <span class="dropzone__icon">✅</span>
                    <span class="dropzone__filename">{{ pdfFile.name }}</span>
                    <button type="button" class="dropzone__clear" @click.stop="pdfFile = null">✕</button>
                  </div>
                </div>
                <div v-if="progress.pdf > 0 && progress.pdf < 100" class="progress-bar">
                  <div class="progress-bar__fill" :style="{ width: progress.pdf + '%' }"></div>
                </div>
              </div>
            </div>

            <!-- Error / Success -->
            <Transition name="fade">
              <div v-if="formError" class="alert alert--error">⚠️ {{ formError }}</div>
            </Transition>
            <Transition name="fade">
              <div v-if="formSuccess" class="alert alert--success">✅ {{ formSuccess }}</div>
            </Transition>

            <div class="modal-actions modal-actions--form">
              <button type="button" class="btn-ghost" @click="showAddModal = false">Cancel</button>
              <button id="submit-song" type="submit" class="btn-primary" :disabled="submitting">
                <span v-if="submitting" class="spinner"></span>
                {{ submitting ? 'Uploading…' : 'Add Song' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase, fetchSongs, insertSong, updateSong, deleteSong, uploadAudio, uploadChordChart } from '../lib/supabase.js'

const router = useRouter()

// ── Add modal state ────────────────────────────────────────────────────────────
const showAddModal = ref(false)

// ── Form state ──────────────────────────────────────────────────────────────
const form = ref({ title: '', key: '', bpm: null, tags: '' })
const audioFile = ref(null)
const pdfFile = ref(null)
const dragOver = ref({ audio: false, pdf: false })
const progress = ref({ audio: 0, pdf: 0 })
const submitting = ref(false)
const formError = ref('')
const formSuccess = ref('')

function openAddModal() {
  form.value = { title: '', key: '', bpm: null, tags: '' }
  audioFile.value = null
  pdfFile.value = null
  progress.value = { audio: 0, pdf: 0 }
  formError.value = ''
  formSuccess.value = ''
  showAddModal.value = true
}

// ── Table state ──────────────────────────────────────────────────────────────
const songs = ref([])
const loadingTable = ref(true)
const deleteTarget = ref(null)
const deleting = ref(false)

// ── Edit state ───────────────────────────────────────────────────────────────
const editTarget = ref(null)
const editForm = ref({ title: '', key: '', bpm: null, tags: '' })
const editAudioFile = ref(null)
const editPdfFile = ref(null)
const editDragOver = ref({ audio: false, pdf: false })
const editSaving = ref(false)
const editError = ref('')

// ── Keys list ────────────────────────────────────────────────────────────────
const musicalKeys = [
  'C Major','C Minor','C# Major','C# Minor',
  'D Major','D Minor','Db Major',
  'Eb Major','Eb Minor',
  'E Major','E Minor',
  'F Major','F Minor','F# Major','F# Minor',
  'G Major','G Minor','G# Major',
  'Ab Major',
  'A Major','A Minor',
  'Bb Major','Bb Minor',
  'B Major','B Minor',
]

// ── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(loadSongs)

async function loadSongs() {
  loadingTable.value = true
  const { data, error } = await fetchSongs()
  if (!error) songs.value = data ?? []
  loadingTable.value = false
}

// ── File pickers ─────────────────────────────────────────────────────────────
function onPickAudio(e) { audioFile.value = e.target.files[0] ?? null }
function onPickPdf(e)   { pdfFile.value  = e.target.files[0] ?? null }
function onDropAudio(e) { audioFile.value = e.dataTransfer.files[0] ?? null }
function onDropPdf(e)   { pdfFile.value  = e.dataTransfer.files[0] ?? null }

// ── Submit ───────────────────────────────────────────────────────────────────
async function handleAddSong() {
  formError.value = ''
  formSuccess.value = ''
  submitting.value = true

  try {
    const slugId = `song-${Date.now()}`

    // Upload audio (if selected)
    let audio_url = null
    if (audioFile.value) {
      progress.value.audio = 30
      const { publicUrl, error } = await uploadAudio(audioFile.value, slugId)
      if (error) throw new Error('Audio upload failed: ' + error.message)
      audio_url = publicUrl
      progress.value.audio = 100
    }

    // Upload PDF (if selected)
    let pdf_url = null
    if (pdfFile.value) {
      progress.value.pdf = 30
      const { publicUrl, error } = await uploadChordChart(pdfFile.value, slugId)
      if (error) throw new Error('PDF upload failed: ' + error.message)
      pdf_url = publicUrl
      progress.value.pdf = 100
    }

    // Parse tags
    const tags = form.value.tags
      ? form.value.tags.split(',').map(t => t.trim()).filter(Boolean)
      : []

    // Insert song row
    const { error: insertError } = await insertSong({
      title: form.value.title,
      key: form.value.key,
      bpm: form.value.bpm,
      tags,
      audio_url,
      pdf_url,
    })

    if (insertError) throw new Error('Database insert failed: ' + insertError.message)

    formSuccess.value = `"${form.value.title}" added successfully!`
    form.value = { title: '', key: '', bpm: null, tags: '' }
    audioFile.value = null
    pdfFile.value = null
    progress.value = { audio: 0, pdf: 0 }

    await loadSongs()
    // Close modal after a brief success flash
    setTimeout(() => {
      showAddModal.value = false
      formSuccess.value = ''
    }, 1200)
  } catch (err) {
    formError.value = err.message
  } finally {
    submitting.value = false
  }
}

// ── Delete ───────────────────────────────────────────────────────────────────
function confirmDelete(song) { deleteTarget.value = song }

async function handleDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  const { error } = await deleteSong(deleteTarget.value.id)
  deleting.value = false
  deleteTarget.value = null
  if (!error) await loadSongs()
}

// ── Edit ─────────────────────────────────────────────────────────────────────
function openEdit(song) {
  editTarget.value = song
  editForm.value = {
    title: song.title,
    key: song.key,
    bpm: song.bpm,
    tags: Array.isArray(song.tags) ? song.tags.join(', ') : (song.tags ?? ''),
  }
  editAudioFile.value = null
  editPdfFile.value = null
  editError.value = ''
}

async function handleEditSong() {
  if (!editTarget.value) return
  editError.value = ''
  editSaving.value = true

  try {
    const slugId = `song-${editTarget.value.id}`
    const updates = {}

    // Upload new audio if provided
    if (editAudioFile.value) {
      const { publicUrl, error } = await uploadAudio(editAudioFile.value, slugId)
      if (error) throw new Error('Audio upload failed: ' + error.message)
      updates.audio_url = publicUrl
    }

    // Upload new PDF if provided
    if (editPdfFile.value) {
      const { publicUrl, error } = await uploadChordChart(editPdfFile.value, slugId)
      if (error) throw new Error('PDF upload failed: ' + error.message)
      updates.pdf_url = publicUrl
    }

    // Parse tags
    updates.tags = editForm.value.tags
      ? editForm.value.tags.split(',').map(t => t.trim()).filter(Boolean)
      : []

    updates.title = editForm.value.title
    updates.key = editForm.value.key
    updates.bpm = editForm.value.bpm

    const { error: updateError } = await updateSong(editTarget.value.id, updates)
    if (updateError) throw new Error('Update failed: ' + updateError.message)

    editTarget.value = null
    await loadSongs()
  } catch (err) {
    editError.value = err.message
  } finally {
    editSaving.value = false
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────
async function handleSignOut() {
  await supabase.auth.signOut()
  router.push('/admin/login')
}
</script>

<style scoped>
/* ── Layout ──────────────────────────────────────────────────────────────── */
.admin-wrapper {
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.admin-header__brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.logo-icon { font-size: 1.4rem; }

.logo-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
}

.gradient-text {
  background: linear-gradient(135deg, #a78bfa, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.admin-badge {
  background: rgba(124,58,237,0.3);
  border: 1px solid rgba(124,58,237,0.5);
  color: #c4b5fd;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 99px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.admin-header__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.admin-main {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* ── Glass card ──────────────────────────────────────────────────────────── */
.glass {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 40px rgba(0,0,0,0.3);
  border-radius: 1.25rem;
}

.admin-section {
  padding: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-header__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-sm-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 1rem;
  border-radius: 0.6rem;
  border: none;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}
.btn-sm-primary:hover { opacity: 0.9; transform: translateY(-1px); }


.section-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-icon { font-size: 1.1rem; }

/* ── Form ────────────────────────────────────────────────────────────────── */
.song-form { display: flex; flex-direction: column; gap: 1.2rem; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
}

.field-group { display: flex; flex-direction: column; gap: 0.4rem; }
.field-group--full { grid-column: 1 / -1; }

.field-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255,255,255,0.55);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.field-hint {
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: rgba(255,255,255,0.3);
}

.field-input {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06);
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.field-input::placeholder { color: rgba(255,255,255,0.25); }
.field-input:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124,58,237,0.2);
}
.field-input option { background: #1e1b4b; color: #fff; }

/* ── Dropzone ────────────────────────────────────────────────────────────── */
.dropzone {
  border: 2px dashed rgba(255,255,255,0.18);
  border-radius: 0.85rem;
  padding: 1.2rem;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.dropzone:hover,
.dropzone--active {
  border-color: #7c3aed;
  background: rgba(124,58,237,0.08);
}

.dropzone--filled {
  border-color: #10b981;
  background: rgba(16,185,129,0.06);
}

.file-hidden { display: none; }

.dropzone__prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  color: rgba(255,255,255,0.4);
  font-size: 0.85rem;
}

.dropzone__preview {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #6ee7b7;
  font-size: 0.85rem;
}

.dropzone__icon { font-size: 1.5rem; }

.dropzone__filename {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropzone__clear {
  background: none;
  border: none;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
}
.dropzone__clear:hover { color: #f87171; }

/* ── Progress bar ────────────────────────────────────────────────────────── */
.progress-bar {
  height: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 99px;
  overflow: hidden;
  margin-top: 0.4rem;
}

.progress-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #10b981);
  border-radius: 99px;
  transition: width 0.3s ease;
}

/* ── Alerts ──────────────────────────────────────────────────────────────── */
.alert {
  padding: 0.75rem 1rem;
  border-radius: 0.6rem;
  font-size: 0.85rem;
}
.alert--error {
  background: rgba(239,68,68,0.15);
  border: 1px solid rgba(239,68,68,0.35);
  color: #fca5a5;
}
.alert--success {
  background: rgba(16,185,129,0.12);
  border: 1px solid rgba(16,185,129,0.35);
  color: #6ee7b7;
}

/* ── Buttons ─────────────────────────────────────────────────────────────── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem 1.8rem;
  border-radius: 0.75rem;
  border: none;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  align-self: flex-start;
}
.btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary.btn-danger { background: linear-gradient(135deg, #dc2626, #b91c1c); }

.btn-ghost {
  background: none;
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.6);
  padding: 0.5rem 1rem;
  border-radius: 0.6rem;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.btn-ghost:hover { background: rgba(255,255,255,0.08); color: #fff; border-color: rgba(255,255,255,0.3); }
.btn-ghost.btn-danger:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.4); color: #fca5a5; }
.btn-ghost.btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.3rem;
  border-radius: 0.4rem;
  transition: background 0.2s;
}
.btn-icon.btn-danger:hover { background: rgba(239,68,68,0.15); }
.btn-icon.btn-edit:hover { background: rgba(124,58,237,0.15); }

/* ── Table ───────────────────────────────────────────────────────────────── */
.table-wrapper { overflow-x: auto; }

.song-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.song-table th {
  text-align: left;
  padding: 0.7rem 1rem;
  color: rgba(255,255,255,0.4);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.song-table td {
  padding: 0.85rem 1rem;
  color: rgba(255,255,255,0.85);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  vertical-align: middle;
}

.song-row:hover td { background: rgba(255,255,255,0.03); }

.song-title { font-weight: 600; }

.badge {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge--key { background: rgba(124,58,237,0.25); color: #c4b5fd; }
.badge--bpm { background: rgba(16,185,129,0.2); color: #6ee7b7; }

.status { font-size: 1rem; }
.status--missing { color: rgba(255,255,255,0.2); }

.actions-cell { white-space: nowrap; }

.table-loading,
.table-empty {
  text-align: center;
  color: rgba(255,255,255,0.35);
  padding: 2rem;
  font-size: 0.9rem;
}

/* ── Delete modal ────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 1rem;
}

.modal {
  max-width: 420px;
  width: 100%;
  padding: 2rem;
  animation: slideUp 0.25s ease both;
}

.modal--wide {
  max-width: 680px;
}

.modal-actions--form {
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.75rem;
}

.modal-body {
  color: rgba(255,255,255,0.6);
  font-size: 0.9rem;
  margin: 0 0 1.5rem;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

/* ── Spinner ─────────────────────────────────────────────────────────────── */
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* ── Transitions ─────────────────────────────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 600px) {
  .admin-header { padding: 0.75rem 1rem; }
  .admin-main { padding: 1rem; }
  .admin-section { padding: 1.25rem; }
  .form-grid { grid-template-columns: 1fr; }
  .field-group--full { grid-column: 1; }
}
</style>
