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

          <div class="sunday-banner__songs">
            <div
              v-for="(song, idx) in bannerSongs"
              :key="song.id"
              class="sunday-song-row"
            >
              <span class="sunday-song-row__num">{{ idx + 1 }}</span>
              <span class="sunday-song-row__title">{{ song.title }}</span>
              <div class="sunday-song-row__meta">
                <span class="badge badge--key">{{ song.key }}</span>
                <span class="badge badge--bpm">{{ song.bpm }}</span>
              </div>
            </div>
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
    <SongList v-else :songs="filteredSongs" :searchQuery="searchQuery" />
  </div>
</template>

<script src="./HomeView.logic.js"></script>

<style src="../styles/views/HomeView.css" scoped></style>
