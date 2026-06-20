<template>
  <div class="admin-wrapper">

    <!-- ── Header ─────────────────────────────────────────────────────── -->
    <header class="admin-header glass">
      <div class="admin-header__brand">
        <img src="../assets/logo-glow.png" alt="Worship Hub" class="app-logo-img" />
        <span class="admin-badge">Admin</span>
      </div>
      <div class="admin-header__actions">
        <RouterLink to="/" class="btn-ghost">← Home</RouterLink>
        <button id="admin-signout" class="btn-ghost btn-danger" @click="handleSignOut">Sign Out</button>
      </div>
    </header>

    <main class="admin-main">
      
      <!-- ── Tabs ───────────────────────────────────────────────────────── -->
      <div class="admin-tabs glass">
        <button 
          class="admin-tab" 
          :class="{ 'admin-tab--active': activeTab === 'library' }" 
          @click="activeTab = 'library'"
        >
          <span class="tab-icon">🎶</span> Song Library
        </button>
        <button 
          class="admin-tab" 
          :class="{ 'admin-tab--active': activeTab === 'setlist' }" 
          @click="activeTab = 'setlist'"
        >
          <span class="tab-icon">🗓️</span> Sunday Setlist
        </button>
        <button 
          class="admin-tab" 
          :class="{ 'admin-tab--active': activeTab === 'artists' }" 
          @click="activeTab = 'artists'"
        >
          <span class="tab-icon">🎤</span> Artists
        </button>
      </div>

      <!-- ── Song Management Table ─────────────────────────────────────── -->
      <section v-show="activeTab === 'library'" class="admin-section glass">
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
                <th>Artist</th>
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
                <td><span class="song-artist">{{ song.artists?.name || '—' }}</span></td>
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

      <!-- ── Sunday Setlist ─────────────────────────────────────────────── -->
      <section v-show="activeTab === 'setlist'" class="admin-section glass">
        <div class="section-header">
          <h2 class="section-title"><span class="section-icon">🗓️</span> Sunday Setlist</h2>
        </div>

        <!-- Status badge -->
        <div v-if="setlistLoading" class="table-loading">Loading setlist…</div>
        <template v-else>
          <span
            class="setlist-status"
            :class="{
              'setlist-status--active': setlistStatus === 'active',
              'setlist-status--expired': setlistStatus === 'expired',
              'setlist-status--empty': setlistStatus === 'empty',
            }"
          >
            <span v-if="setlistStatus === 'active'">🟢 Active — {{ formatDate(setlistSundayDate) }}</span>
            <span v-else-if="setlistStatus === 'expired'">🔴 Expired — {{ formatDate(setlistSundayDate) }}</span>
            <span v-else>⚪ No setlist set</span>
          </span>

          <!-- Meta: label + sunday date -->
          <div class="setlist-meta">
            <div class="field-group">
              <label class="field-label" for="sl-label">Service Label</label>
              <input
                id="sl-label"
                v-model="setlistLabel"
                class="field-input"
                type="text"
                placeholder="e.g. June 22 Morning Service"
              />
            </div>
            <div class="field-group">
              <label class="field-label" for="sl-date">Sunday Date</label>
              <VueDatePicker 
                v-model="setlistDate" 
                :enable-time-picker="false" 
                auto-apply 
                format="yyyy-MM-dd" 
                model-type="yyyy-MM-dd" 
                dark
                class="worship-datepicker"
              />
            </div>
          </div>

          <!-- Picked songs list -->
          <div class="setlist-picked">
            <div v-if="pickedSongs.length === 0" class="setlist-picked__empty">
              No songs picked yet — search and select from the library below.
            </div>
            <div
              v-for="(song, idx) in pickedSongs"
              :key="song.id"
              class="setlist-song-item"
            >
              <span class="setlist-song-item__num">{{ idx + 1 }}</span>
              <span class="setlist-song-item__title">{{ song.title }}</span>
              <div class="setlist-song-item__meta">
                <span class="badge badge--key">{{ song.key }}</span>
                <span class="badge badge--bpm">{{ song.bpm }}</span>
              </div>
              <button
                class="setlist-song-item__remove"
                title="Remove from setlist"
                @click="removeSongFromSetlist(song.id)"
              >✕</button>
            </div>
          </div>

          <hr class="setlist-divider" />

          <!-- Song picker -->
          <div class="setlist-picker">
            <div class="picker-search-wrap">
              <span class="picker-search-icon">🔍</span>
              <input
                id="setlist-search"
                v-model="pickerQuery"
                class="picker-search"
                type="text"
                placeholder="Search songs to add…"
              />
            </div>

            <div class="picker-list">
              <div v-if="filteredPickerSongs.length === 0" class="picker-empty">
                No songs found.
              </div>
              <div
                v-for="song in filteredPickerSongs"
                :key="song.id"
                class="picker-item"
                :class="{ 'picker-item--selected': isInSetlist(song.id) }"
                @click="toggleSongInSetlist(song)"
              >
                <div class="picker-item__info">
                  <div class="picker-item__check">{{ isInSetlist(song.id) ? '✓' : '' }}</div>
                  <span class="picker-item__title">{{ song.title }} <span class="picker-item__artist" v-if="song.artists?.name">({{song.artists.name}})</span></span>
                </div>
                <div class="picker-item__meta">
                  <span class="badge badge--key">{{ song.key }}</span>
                  <span class="badge badge--bpm">{{ song.bpm }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions footer -->
          <div class="setlist-actions">
            <span class="setlist-count">
              <strong>{{ pickedSongs.length }}</strong> song{{ pickedSongs.length !== 1 ? 's' : '' }} selected
            </span>
            <div style="display:flex; gap:0.75rem; align-items:center;">
              <button
                class="btn-ghost btn-sm btn-danger"
                :disabled="setlistSaving"
                @click="handleClearSetlist"
              >🗑 Clear Setlist</button>
              <button
                id="save-setlist"
                class="btn-primary btn-sm-primary"
                :disabled="setlistSaving || pickedSongs.length === 0"
                @click="handleSaveSetlist"
              >
                <span v-if="setlistSaving" class="spinner"></span>
                {{ setlistSaving ? 'Saving…' : '💾 Save Setlist' }}
              </button>
            </div>
          </div>

          <!-- Feedback -->
          <Transition name="fade">
            <div v-if="setlistError" class="alert alert--error" style="margin-top:1rem;">⚠️ {{ setlistError }}</div>
          </Transition>
          <Transition name="fade">
            <div v-if="setlistSuccess" class="alert alert--success" style="margin-top:1rem;">✅ {{ setlistSuccess }}</div>
          </Transition>
        </template>
      </section>

    </main>

    <!-- ── Artists Tab ──────────────────────────────────────────────────────── -->
    <section v-show="activeTab === 'artists'" class="admin-section glass" style="max-width: 960px; margin: 0 auto; width: 100%; padding: 2rem 1.5rem;">
      <div class="section-header">
        <h2 class="section-title"><span class="section-icon">🎤</span> Manage Artists</h2>
        <div class="section-header__actions">
          <button class="btn-primary btn-sm-primary" @click="openAddArtistModal">➕ Add Artist</button>
        </div>
      </div>

      <div v-if="loadingArtists" class="table-loading">Loading artists…</div>
      <div v-else-if="artists.length === 0" class="table-empty">
        No artists yet. Add one to use in your songs!
      </div>
      <div v-else class="table-wrapper">
        <table class="song-table">
          <thead>
            <tr>
              <th>Artist Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="artist in artists" :key="artist.id" class="song-row">
              <td class="song-title">{{ artist.name }}</td>
              <td class="actions-cell">
                <button class="btn-icon btn-edit" title="Edit artist" @click="openEditArtist(artist)">✏️</button>
                <button class="btn-icon btn-danger" title="Delete artist" @click="confirmDeleteArtist(artist)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ── Delete Confirm Modal ────────────────────────────────────────── -->
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

    <!-- ── Delete Artist Confirm Modal ────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="deleteArtistTarget" class="modal-overlay" @click.self="deleteArtistTarget = null">
        <div class="modal glass">
          <h3 class="modal-title">Delete Artist?</h3>
          <p class="modal-body">
            Are you sure you want to delete <strong>{{ deleteArtistTarget?.name }}</strong>?
            This will remove the artist from all assigned songs.
          </p>
          <div class="modal-actions">
            <button class="btn-ghost" @click="deleteArtistTarget = null">Cancel</button>
            <button class="btn-primary btn-danger" @click="handleDeleteArtist" :disabled="artistDeleting">
              <span v-if="artistDeleting" class="spinner"></span>
              {{ artistDeleting ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Add/Edit Artist Modal ─────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="showArtistModal" class="modal-overlay" @click.self="showArtistModal = false">
        <div class="modal glass">
          <h3 class="modal-title">{{ editArtistTarget ? '✏️ Edit Artist' : '➕ Add Artist' }}</h3>
          <form class="song-form" @submit.prevent="handleSaveArtist">
            <div class="field-group">
              <label class="field-label" for="a-name">Artist Name *</label>
              <input id="a-name" v-model="artistForm.name" class="field-input" type="text" required placeholder="e.g. Hillsong" />
            </div>
            
            <Transition name="fade">
              <div v-if="artistError" class="alert alert--error" style="margin-top:1rem;">⚠️ {{ artistError }}</div>
            </Transition>

            <div class="modal-actions modal-actions--form" style="margin-top: 2rem;">
              <button type="button" class="btn-ghost" @click="showArtistModal = false">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="artistSubmitting">
                <span v-if="artistSubmitting" class="spinner"></span>
                {{ artistSubmitting ? 'Saving…' : 'Save Artist' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- ── Edit Song Modal ──────────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="editTarget" class="modal-overlay" @click.self="editTarget = null">
        <div class="modal modal--wide glass">
          <h3 class="modal-title">✏️ Edit Song</h3>

          <form class="song-form" @submit.prevent="handleEditSong">
            <div class="form-grid">
              <!-- Title -->
              <div class="field-group">
                <label class="field-label" for="e-title">Song Title *</label>
                <input id="e-title" v-model="editForm.title" class="field-input" type="text" required />
              </div>
              
              <!-- Artist -->
              <div class="field-group">
                <label class="field-label" for="e-artist">Artist</label>
                <select id="e-artist" v-model="editForm.artist_id" class="field-input">
                  <option value="">No Artist</option>
                  <option v-for="a in artists" :key="a.id" :value="a.id">{{ a.name }}</option>
                </select>
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

    <!-- ── Add Song Modal ────────────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
        <div class="modal modal--wide glass">
          <h3 class="modal-title">➕ Add New Song</h3>

          <form id="add-song-form" class="song-form" @submit.prevent="handleAddSong">
            <div class="form-grid">
              <!-- Title -->
              <div class="field-group">
                <label class="field-label" for="f-title">Song Title *</label>
                <input id="f-title" v-model="form.title" class="field-input" type="text"
                  placeholder="e.g. Way Maker" required />
              </div>

              <!-- Artist -->
              <div class="field-group">
                <label class="field-label" for="f-artist">Artist</label>
                <select id="f-artist" v-model="form.artist_id" class="field-input">
                  <option value="">No Artist</option>
                  <option v-for="a in artists" :key="a.id" :value="a.id">{{ a.name }}</option>
                </select>
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

<script src="./AdminView.logic.js"></script>

<style src="../styles/views/AdminView.css" scoped></style>
