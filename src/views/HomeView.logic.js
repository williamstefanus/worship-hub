import { ref, computed, onMounted } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import SongList from '../components/SongList.vue'
import { fetchSongs, fetchSetlist } from '../lib/supabase.js'

export default {
  components: { AppHeader, SongList },
  setup() {
    const searchQuery = ref('')
    const songs = ref([])
    const loading = ref(true)
    const error = ref(null)

    const setlist = ref(null)

    const showBanner = computed(() => {
      if (!setlist.value) return false
      if (!setlist.value.song_ids || setlist.value.song_ids.length === 0) return false
      const today = new Date().toISOString().slice(0, 10)
      return setlist.value.sunday_date >= today
    })

    const bannerSongs = computed(() => {
      if (!setlist.value?.song_ids) return []
      return setlist.value.song_ids
        .map(id => songs.value.find(s => s.id === id))
        .filter(Boolean)
    })

    function formatDate(isoDate) {
      if (!isoDate) return ''
      return new Date(isoDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    }

    onMounted(async () => {
      const [songsResult, setlistResult] = await Promise.all([
        fetchSongs(),
        fetchSetlist(),
      ])

      loading.value = false

      if (songsResult.error) {
        error.value = songsResult.error.message
      } else {
        songs.value = songsResult.data ?? []
      }

      if (!setlistResult.error && setlistResult.data) {
        setlist.value = setlistResult.data
      }
    })

    const filteredSongs = computed(() => {
      const q = searchQuery.value.trim().toLowerCase()
      if (!q) return songs.value
      return songs.value.filter(song =>
        song.title.toLowerCase().includes(q) ||
        (song.artist && song.artist.toLowerCase().includes(q)) ||
        song.key.toLowerCase().includes(q) ||
        song.bpm.toString().includes(q) ||
        song.tags?.some(tag => tag.toLowerCase().includes(q))
      )
    })

    return {
      searchQuery,
      songs,
      loading,
      error,
      setlist,
      showBanner,
      bannerSongs,
      formatDate,
      filteredSongs
    }
  }
}
