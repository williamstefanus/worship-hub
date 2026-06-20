<template>
  <div>
    <AppHeader v-model="searchQuery" />

    <!-- ── Sunday Setlist Banner ────────────────────────────────────────── -->
    <Transition name="fade">
      <section
        v-if="showBanner"
        class="sunday-banner"
        aria-label="This Sunday's setlist"
      >
        <div class="sunday-banner__card">
          <div class="sunday-banner__header">
            <div class="sunday-banner__title-group">
              <span class="sunday-banner__icon">🗓️</span>
              <div>
                <h2 class="sunday-banner__title">This Sunday</h2>
                <div class="sunday-banner__label">{{ setlist.label }}</div>
              </div>
            </div>
            <span class="sunday-banner__date">{{ formatDate(setlist.sunday_date) }}</span>
          </div>

          <div class="sunday-banner__songs" style="display: flex; flex-direction: column; gap: 8px;">
            <SongCard
              v-for="(song, idx) in bannerSongs"
              :key="song.id"
              :song="song"
              variant="banner"
              :index="idx"
            />
          </div>
        </div>
      </section>
    </Transition>

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
    <div v-else style="max-width: 760px; margin: 0 auto; padding: 0 16px;">
      <h2 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem; letter-spacing: -0.01em;">
        <span style="opacity: 0.6; margin-right: 0.4rem;">🎶</span> Song Library
      </h2>
    </div>
    <SongList v-if="!loading && !error" :songs="filteredSongs" :searchQuery="searchQuery" />
  </div>
</template>

<script src="./HomeView.logic.js"></script>

<style src="../styles/views/HomeView.css" scoped></style>
