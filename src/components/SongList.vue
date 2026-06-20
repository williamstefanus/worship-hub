<template>
  <main class="song-list-page" id="main-content" role="main">
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

<script src="./SongList.logic.js"></script>

<style src="../styles/components/SongList.css" scoped></style>
