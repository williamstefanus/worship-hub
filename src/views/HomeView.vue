<template>
  <div>
    <AppHeader v-model="searchQuery" />

    <!-- Loading state -->
    <div v-if="loading" class="state-message">
      <div class="spinner"></div>
      <span>Loading songs…</span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="state-message state-message--error">
      ⚠️ Failed to load songs: {{ error }}
    </div>

    <!-- Song list -->
    <SongList v-else :songs="filteredSongs" :searchQuery="searchQuery" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import SongList from '../components/SongList.vue'
import { fetchSongs } from '../lib/supabase.js'

const searchQuery = ref('')
const songs = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  const { data, error: err } = await fetchSongs()
  loading.value = false
  if (err) {
    error.value = err.message
  } else {
    songs.value = data ?? []
  }
})

const filteredSongs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return songs.value
  return songs.value.filter(song =>
    song.title.toLowerCase().includes(q) ||
    song.key.toLowerCase().includes(q) ||
    song.bpm.toString().includes(q) ||
    song.tags?.some(tag => tag.toLowerCase().includes(q))
  )
})
</script>

<style scoped>
.state-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 40vh;
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.95rem;
}

.state-message--error {
  color: #fca5a5;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
