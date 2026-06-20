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
        <!-- Section heading — same level as Song Library -->
        <div class="sunday-banner__section-header">
          <h1 class="sunday-banner__section-title">
            <span style="opacity: 0.6; margin-right: 0.4rem;">🗓️</span> This Sunday
          </h1>
          <h2 class="sunday-banner__date">{{ formatDate(setlist.sunday_date) }}</h2>
        </div>

        <div class="sunday-banner__card">
          <div v-if="setlist.label" class="sunday-banner__label" style="margin-bottom: 1rem;">{{ setlist.label }}</div>

          <div v-if="setlist.verse" class="sunday-banner__verse">
            <span class="verse-icon">📖</span>
            <p class="verse-text">{{ setlist.verse }}</p>
          </div>

          <div class="sunday-banner__roster" v-if="hasMusicians">
            <div class="sunday-banner__roster-title">👥 Volunteers</div>
            <div class="roster-chips">
              <div class="roster-item" v-if="setlist.musicians['Worship Leader']">
                <span class="roster-icon">🎤</span>
                <span class="roster-role">WL</span>
                <span class="roster-names">{{ setlist.musicians['Worship Leader'] }}</span>
              </div>
              <div class="roster-item" v-if="setlist.musicians['Singers']">
                <span class="roster-icon">🎤</span>
                <span class="roster-role">Singers</span>
                <span class="roster-names">{{ setlist.musicians['Singers'] }}</span>
              </div>
              <div class="roster-item" v-if="setlist.musicians['Keyboard']">
                <span class="roster-icon">🎹</span>
                <span class="roster-role">Keys</span>
                <span class="roster-names">{{ setlist.musicians['Keyboard'] }}</span>
              </div>
              <div class="roster-item" v-if="setlist.musicians['Guitar']">
                <span class="roster-icon">🎸</span>
                <span class="roster-role">Guitar</span>
                <span class="roster-names">{{ setlist.musicians['Guitar'] }}</span>
              </div>
              <div class="roster-item" v-if="setlist.musicians['Bass']">
                <span class="roster-icon">🎸</span>
                <span class="roster-role">Bass</span>
                <span class="roster-names">{{ setlist.musicians['Bass'] }}</span>
              </div>
              <div class="roster-item" v-if="setlist.musicians['Saxophone']">
                <span class="roster-icon">🎷</span>
                <span class="roster-role">Sax</span>
                <span class="roster-names">{{ setlist.musicians['Saxophone'] }}</span>
              </div>
              <div class="roster-item" v-if="setlist.musicians['Drum']">
                <span class="roster-icon">🥁</span>
                <span class="roster-role">Drum</span>
                <span class="roster-names">{{ setlist.musicians['Drum'] }}</span>
              </div>
            </div>
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
    <div v-else style="max-width: 760px; margin: 32px auto 16px; padding: 0 16px;">
      <div style="display: flex; align-items: baseline; justify-content: space-between;">
        <h1 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin: 0; letter-spacing: -0.01em;">
          <span style="opacity: 0.6; margin-right: 0.4rem;">🎶</span> Song Library
        </h1>
        <div class="list-summary" style="margin: 0; font-size: 0.85rem; color: rgba(255,255,255,0.4); text-align: right;">
          <span v-if="filteredSongs.length === 0 && searchQuery">
            No results for "<strong>{{ searchQuery }}</strong>"
          </span>
          <span v-else-if="searchQuery">
            {{ filteredSongs.length }} result{{ filteredSongs.length !== 1 ? 's' : '' }} for "<strong>{{ searchQuery }}</strong>"
          </span>
          <span v-else>
            <strong>{{ filteredSongs.length }}</strong> songs in your library
          </span>
        </div>
      </div>
    </div>
    <SongList v-if="!loading && !error" :songs="filteredSongs" :searchQuery="searchQuery" />
  </div>
</template>

<script src="./HomeView.logic.js"></script>

<style src="../styles/views/HomeView.css" scoped></style>
