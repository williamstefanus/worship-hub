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

<style src="../styles/components/SongList.css" scoped></style>
