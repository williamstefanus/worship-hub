<template>
  <main class="song-list-page" id="main-content" role="main">
    <!-- Results Summary -->
    <div class="list-summary">
      <span v-if="songs.length === 0 && searchQuery">
        No results for "<strong>{{ searchQuery }}</strong>"
      </span>
      <span v-else-if="searchQuery">
        {{ songs.length }} result{{ songs.length !== 1 ? 's' : '' }} for "<strong>{{ searchQuery }}</strong>"
      </span>
      <span v-else>
        <strong>{{ songs.length }}</strong> songs in your library
      </span>
    </div>

    <!-- Song Cards Grid -->
    <TransitionGroup
      name="list"
      tag="section"
      class="songs-grid"
      aria-label="Song list"
    >
      <SongCard
        v-for="song in songs"
        :key="song.id"
        :song="song"
      />
    </TransitionGroup>

    <!-- Empty State -->
    <Transition name="fade">
      <div v-if="songs.length === 0" class="empty-state" role="status" aria-live="polite">
        <div class="empty-state__icon" aria-hidden="true">🎵</div>
        <p class="empty-state__title">No songs found</p>
        <p class="empty-state__sub">Try a different search term</p>
      </div>
    </Transition>
  </main>
</template>

<script setup>
import SongCard from './SongCard.vue'

defineProps({
  songs: {
    type: Array,
    default: () => [],
  },
  searchQuery: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
/* ── Page ────────────────────────────────────────────────────── */
.song-list-page {
  padding: 20px 16px 80px;
  max-width: 760px;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .song-list-page {
    padding: 28px 24px 80px;
  }
}

/* ── Summary ─────────────────────────────────────────────────── */
.list-summary {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-bottom: 16px;
  padding: 0 2px;
}

.list-summary strong {
  color: var(--text-secondary);
  font-weight: 600;
}

/* ── Songs Grid ──────────────────────────────────────────────── */
.songs-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── Empty State ─────────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-state__icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.4;
}

.empty-state__title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin: 0 0 6px;
}

.empty-state__sub {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
}

/* ── TransitionGroup Animations ──────────────────────────────── */
.list-enter-active {
  transition: all 0.3s ease;
}
.list-leave-active {
  transition: all 0.2s ease;
  position: absolute;
  width: 100%;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
.list-move {
  transition: transform 0.3s ease;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
