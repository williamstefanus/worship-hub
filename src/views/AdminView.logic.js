import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import VueDatePicker from "@vuepic/vue-datepicker"
import "@vuepic/vue-datepicker/dist/main.css"
import {
  supabase, fetchSongs, insertSong, updateSong, deleteSong,
  uploadAudio, uploadChordChart,
  fetchSetlist, updateSetlist, clearSetlist,
  fetchArtists, insertArtist, updateArtist, deleteArtist
} from "../lib/supabase.js"

export default {
  components: { VueDatePicker },
  setup() {
    const router = useRouter()
    
    // ── Tabs State ───────────────────────────────────────────────────────────────
    const activeTab = ref('library')
    
    // ── Add modal state ────────────────────────────────────────────────────────────
    const showAddModal = ref(false)
    
    // ── Form state ──────────────────────────────────────────────────────────────
    const form = ref({ title: '', artist_id: '', key: '', bpm: null, tags: '' })
    const audioFile = ref(null)
    const pdfFile = ref(null)
    const dragOver = ref({ audio: false, pdf: false })
    const progress = ref({ audio: 0, pdf: 0 })
    const submitting = ref(false)
    const formError = ref('')
    const formSuccess = ref('')
    
    function openAddModal() {
      form.value = { title: '', artist_id: '', key: '', bpm: null, tags: '' }
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
    const editForm = ref({ title: '', artist_id: '', key: '', bpm: null, tags: '' })
    const editAudioFile = ref(null)
    const editPdfFile = ref(null)
    const editDragOver = ref({ audio: false, pdf: false })
    const editSaving = ref(false)
    const editError = ref('')
    
    // ── Keys list ────────────────────────────────────────────────────────────────
    const musicalKeys = [
      'C Major','C# Major',
      'D Major','Db Major',
      'Eb Major',
      'E Major',
      'F Major','F# Major',
      'G Major','G# Major',
      'Ab Major',
      'A Major',
      'Bb Major',
      'B Major',
    ]
    
    // ── Sunday Setlist state ─────────────────────────────────────────────────────
    const setlistLoading = ref(true)
    const setlistLabel   = ref('Sunday Service')
    const setlistDate    = ref(nextSundayISO())
    const pickedSongIds  = ref([])   // ordered array of song IDs
    const pickerQuery    = ref('')
    const setlistSaving  = ref(false)
    const setlistError   = ref('')
    const setlistSuccess = ref('')
    const setlistSundayDate = ref(null) // ISO date from the DB
    
    /** Derive setlist status from the stored sunday_date vs today */
    const setlistStatus = computed(() => {
      if (!setlistSundayDate.value || pickedSongIds.value.length === 0) return 'empty'
      const today = new Date().toISOString().slice(0, 10)
      return setlistSundayDate.value >= today ? 'active' : 'expired'
    })
    
    /** Songs in the setlist, in order */
    const pickedSongs = computed(() =>
      pickedSongIds.value
        .map(id => songs.value.find(s => s.id === id))
        .filter(Boolean)
    )
    
    /** Songs visible in the picker, filtered by search */
    const filteredPickerSongs = computed(() => {
      const q = pickerQuery.value.trim().toLowerCase()
      if (!q) return songs.value
      return songs.value.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.key.toLowerCase().includes(q) ||
        (s.artists?.name && s.artists.name.toLowerCase().includes(q))
      )
    })
    
    function isInSetlist(songId) {
      return pickedSongIds.value.includes(songId)
    }
    
    function toggleSongInSetlist(song) {
      if (isInSetlist(song.id)) {
        pickedSongIds.value = pickedSongIds.value.filter(id => id !== song.id)
      } else {
        pickedSongIds.value = [...pickedSongIds.value, song.id]
      }
    }
    
    function removeSongFromSetlist(songId) {
      pickedSongIds.value = pickedSongIds.value.filter(id => id !== songId)
    }

    const dragOverIdx = ref(null)
    
    function onDragStart(e, idx) {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', idx.toString())
    }

    function onDragOver(e, idx) {
      e.preventDefault()
      dragOverIdx.value = idx
    }

    function onDragLeave(e, idx) {
      if (dragOverIdx.value === idx) {
        dragOverIdx.value = null
      }
    }

    function onDragEnd() {
      dragOverIdx.value = null
    }

    function onDropSong(e, targetIdx) {
      dragOverIdx.value = null
      const sourceIdxStr = e.dataTransfer.getData('text/plain')
      if (!sourceIdxStr) return
      const sourceIdx = parseInt(sourceIdxStr, 10)
      if (sourceIdx === targetIdx) return

      const updatedList = [...pickedSongIds.value]
      const [movedItem] = updatedList.splice(sourceIdx, 1)
      updatedList.splice(targetIdx, 0, movedItem)
      pickedSongIds.value = updatedList
    }
    
    async function loadSetlist() {
      setlistLoading.value = true
      const { data } = await fetchSetlist()
      if (data) {
        setlistLabel.value       = data.label ?? 'Sunday Service'
        setlistDate.value        = data.sunday_date ?? nextSundayISO()
        setlistSundayDate.value  = data.sunday_date ?? null
        pickedSongIds.value      = data.song_ids ?? []
      }
      setlistLoading.value = false
    }
    
    async function handleSaveSetlist() {
      setlistError.value   = ''
      setlistSuccess.value = ''
      setlistSaving.value  = true
      const { error } = await updateSetlist(
        pickedSongIds.value,
        setlistLabel.value,
        setlistDate.value,
      )
      setlistSaving.value = false
      if (error) {
        setlistError.value = 'Failed to save setlist: ' + error.message
      } else {
        setlistSundayDate.value = setlistDate.value
        setlistSuccess.value = 'Setlist saved successfully!'
        setTimeout(() => { setlistSuccess.value = '' }, 2500)
      }
    }
    
    async function handleClearSetlist() {
      setlistError.value   = ''
      setlistSuccess.value = ''
      setlistSaving.value  = true
      const { error } = await clearSetlist()
      setlistSaving.value = false
      if (error) {
        setlistError.value = 'Failed to clear setlist: ' + error.message
      } else {
        pickedSongIds.value     = []
        setlistLabel.value      = 'Sunday Service'
        setlistDate.value       = nextSundayISO()
        setlistSundayDate.value = null
        setlistSuccess.value    = 'Setlist cleared.'
        setTimeout(() => { setlistSuccess.value = '' }, 2000)
      }
    }
    
    /** Returns the ISO date string of the next Sunday (or today if today is Sunday) */
    function nextSundayISO() {
      const d = new Date()
      const day = d.getDay() // 0 = Sunday
      const diff = day === 0 ? 0 : 7 - day
      d.setDate(d.getDate() + diff)
      return d.toISOString().slice(0, 10)
    }
    
    /** Format ISO date to a readable string e.g. "Sunday, June 22, 2026" */
    function formatDate(isoDate) {
      if (!isoDate) return ''
      return new Date(isoDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    }
    
    // ── Lifecycle ────────────────────────────────────────────────────────────────
    onMounted(async () => {
      await loadArtists()
      await loadSongs()
      await loadSetlist()
    })
    
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
          artist_id: form.value.artist_id || null,
          key: form.value.key,
          bpm: form.value.bpm,
          tags,
          audio_url,
          pdf_url,
        })
    
        if (insertError) throw new Error('Database insert failed: ' + insertError.message)
    
        formSuccess.value = `"${form.value.title}" added successfully!`
        form.value = { title: '', artist_id: '', key: '', bpm: null, tags: '' }
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
        artist_id: song.artist_id ?? '',
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
        updates.artist_id = editForm.value.artist_id || null
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

    // ── Artists Tab Logic ────────────────────────────────────────────────────────
    const artists = ref([])
    const loadingArtists = ref(true)
    const showArtistModal = ref(false)
    const artistForm = ref({ name: '' })
    const artistSubmitting = ref(false)
    const artistError = ref('')
    const editArtistTarget = ref(null)
    const deleteArtistTarget = ref(null)
    const artistDeleting = ref(false)

    async function loadArtists() {
      loadingArtists.value = true
      const { data } = await fetchArtists()
      if (data) artists.value = data
      loadingArtists.value = false
    }

    function openAddArtistModal() {
      artistForm.value = { name: '' }
      artistError.value = ''
      editArtistTarget.value = null
      showArtistModal.value = true
    }

    function openEditArtist(artist) {
      editArtistTarget.value = artist
      artistForm.value = { name: artist.name }
      artistError.value = ''
      showArtistModal.value = true
    }

    async function handleSaveArtist() {
      artistError.value = ''
      artistSubmitting.value = true
      try {
        if (editArtistTarget.value) {
          const { error } = await updateArtist(editArtistTarget.value.id, { name: artistForm.value.name })
          if (error) throw error
        } else {
          const { error } = await insertArtist({ name: artistForm.value.name })
          if (error) throw error
        }
        showArtistModal.value = false
        await loadArtists()
        await loadSongs() // reload songs to get updated artist names
      } catch (err) {
        artistError.value = err.message
      } finally {
        artistSubmitting.value = false
      }
    }

    function confirmDeleteArtist(artist) {
      deleteArtistTarget.value = artist
    }

    async function handleDeleteArtist() {
      if (!deleteArtistTarget.value) return
      artistDeleting.value = true
      await deleteArtist(deleteArtistTarget.value.id)
      artistDeleting.value = false
      deleteArtistTarget.value = null
      await loadArtists()
      await loadSongs()
    }

    return {
      activeTab,
      audioFile,
      confirmDelete,
      deleteTarget,
      deleting,
      dragOver,
      editAudioFile,
      editDragOver,
      editError,
      editForm,
      editPdfFile,
      editSaving,
      editTarget,
      filteredPickerSongs,
      form,
      formError,
      formSuccess,
      formatDate,
      isInSetlist,
      loadingTable,
      musicalKeys,
      nextSundayISO,
      onDropAudio,
      onDropPdf,
      onPickAudio,
      onPickPdf,
      openAddModal,
      openEdit,
      pdfFile,
      pickedSongIds,
      pickedSongs,
      pickerQuery,
      progress,
      removeSongFromSetlist,
      setlistDate,
      setlistError,
      setlistLabel,
      setlistLoading,
      setlistSaving,
      setlistStatus,
      setlistSuccess,
      setlistSundayDate,
      showAddModal,
      songs,
      submitting,
      toggleSongInSetlist,
      artists,
      loadingArtists,
      showArtistModal,
      artistForm,
      artistSubmitting,
      artistError,
      editArtistTarget,
      deleteArtistTarget,
      artistDeleting,
      openAddArtistModal,
      openEditArtist,
      handleSaveArtist,
      confirmDeleteArtist,
      handleDeleteArtist,
      handleSaveSetlist,
      handleClearSetlist,
      loadSongs,
      handleAddSong,
      handleDelete,
      handleEditSong,
      handleSignOut,
      onDragStart,
      onDragOver,
      onDragLeave,
      onDragEnd,
      onDropSong,
      dragOverIdx,
    }
  }
}
