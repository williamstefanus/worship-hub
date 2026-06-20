import { ref, onMounted, onUnmounted } from 'vue'

export default {
  props: {
    song: {
      type: Object,
      required: true,
    },
    variant: {
      type: String,
      default: 'default',
    },
    index: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const isExpanded = ref(false)
    function toggleExpand() {
      isExpanded.value = !isExpanded.value
    }

    const audioEl      = ref(null)
    const scrubberEl   = ref(null)
    const volumeWrapEl = ref(null)
    const isPlaying    = ref(false)
    const isMuted      = ref(false)
    const showVolume   = ref(false)
    const volume       = ref(1)
    const currentTime  = ref(0)
    const duration     = ref(0)
    const progressPct  = ref(0)

    function toggleVolumePanel() {
      showVolume.value = !showVolume.value
    }

    function onClickOutside(e) {
      if (volumeWrapEl.value && !volumeWrapEl.value.contains(e.target)) {
        showVolume.value = false
      }
    }

    onMounted(() => document.addEventListener('click', onClickOutside))
    onUnmounted(() => document.removeEventListener('click', onClickOutside))

    function togglePlay() {
      if (!audioEl.value) return
      if (isPlaying.value) {
        audioEl.value.pause()
        isPlaying.value = false
      } else {
        audioEl.value.play()
        isPlaying.value = true
      }
    }

    function toggleMute() {
      if (!audioEl.value) return
      isMuted.value = !isMuted.value
      audioEl.value.muted = isMuted.value
    }

    function onVolumeChange(e) {
      if (!audioEl.value) return
      const val = parseFloat(e.target.value)
      volume.value = val
      audioEl.value.volume = val
      if (val > 0 && isMuted.value) {
        isMuted.value = false
        audioEl.value.muted = false
      }
      if (val === 0) {
        isMuted.value = true
        audioEl.value.muted = true
      }
    }

    function onTimeUpdate() {
      if (!audioEl.value) return
      currentTime.value = audioEl.value.currentTime
      progressPct.value = duration.value > 0
        ? (currentTime.value / duration.value) * 100
        : 0
    }

    function onMetadata() {
      if (!audioEl.value) return
      duration.value = audioEl.value.duration
    }

    function seek(e) {
      if (!audioEl.value || !scrubberEl.value) return
      const rect = scrubberEl.value.getBoundingClientRect()
      const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      audioEl.value.currentTime = pct * duration.value
    }

    function formatTime(secs) {
      if (!secs || isNaN(secs)) return '0:00'
      const m = Math.floor(secs / 60)
      const s = Math.floor(secs % 60).toString().padStart(2, '0')
      return `${m}:${s}`
    }

    return {
      isExpanded,
      toggleExpand,
      audioEl,
      scrubberEl,
      volumeWrapEl,
      isPlaying,
      isMuted,
      showVolume,
      volume,
      currentTime,
      duration,
      progressPct,
      toggleVolumePanel,
      togglePlay,
      toggleMute,
      onVolumeChange,
      onTimeUpdate,
      onMetadata,
      seek,
      formatTime
    }
  }
}
