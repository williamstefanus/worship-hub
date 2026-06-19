<template>
  <article class="song-card" :class="{ expanded: isExpanded }" :id="`song-card-${song.id}`">
    <!-- Card Header -->
    <div class="song-card__header" @click="toggleExpand">
      <div class="song-card__icon-wrap">
        <span class="song-card__icon">🎵</span>
      </div>

      <div class="song-card__info">
        <h2 class="song-card__title">{{ song.title }}</h2>
        <div class="song-card__meta">
          <span class="badge badge--key" :title="`Key: ${song.key}`">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>
            </svg>
            {{ song.key }}
          </span>
          <span class="badge badge--bpm" :title="`Tempo: ${song.bpm} BPM`">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {{ song.bpm }} BPM
          </span>
        </div>
        <div class="song-card__tags" v-if="song.tags?.length">
          <span v-for="tag in song.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>

      <button
        class="song-card__toggle"
        :aria-expanded="isExpanded"
        :aria-label="isExpanded ? 'Collapse' : 'Expand'"
        @click.stop="toggleExpand"
      >
        <svg
          class="chevron"
          :class="{ rotated: isExpanded }"
          width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
    </div>

    <!-- Expandable Media Section -->
    <Transition name="slide-fade">
      <div v-if="isExpanded" class="song-card__body">
        <div class="divider" />

        <!-- Audio Player -->
        <div class="media-section">
          <div class="media-section__label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
            Audio Guide Track
          </div>
          <audio
            :id="`audio-${song.id}`"
            controls
            preload="metadata"
            class="audio-player"
            :src="song.audio_url"
            :aria-label="`Audio guide for ${song.title}`"
          >
            Your browser does not support the audio element.
          </audio>
        </div>

        <!-- PDF Chord Chart -->
        <div class="media-section">
          <div class="media-section__label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            Chord Chart (PDF)
          </div>
          <a
            :id="`pdf-link-${song.id}`"
            :href="song.pdf_url"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn--pdf"
            :aria-label="`Open chord chart for ${song.title} in new tab`"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Open Chord Chart
          </a>
        </div>
      </div>
    </Transition>
  </article>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  song: {
    type: Object,
    required: true,
  },
})

const isExpanded = ref(false)

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
/* ── Song Card Shell ─────────────────────────────────────────── */
.song-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  cursor: pointer;
}

.song-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  border-color: var(--accent-muted);
}

.song-card.expanded {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent-muted), 0 12px 40px rgba(139, 92, 246, 0.2);
}

/* ── Header ──────────────────────────────────────────────────── */
.song-card__header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
}

.song-card__icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--accent-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.song-card__info {
  flex: 1;
  min-width: 0;
}

.song-card__title {
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.song-card__meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.song-card__tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* ── Badges ──────────────────────────────────────────────────── */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 100px;
  letter-spacing: 0.02em;
}

.badge--key {
  background: rgba(139, 92, 246, 0.15);
  color: #c4b5fd;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.badge--bpm {
  background: rgba(16, 185, 129, 0.12);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.tag {
  font-size: 0.65rem;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* ── Toggle Button ───────────────────────────────────────────── */
.song-card__toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  color: var(--text-muted);
  border-radius: 8px;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}

.song-card__toggle:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.chevron {
  display: block;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chevron.rotated {
  transform: rotate(180deg);
}

/* ── Body / Media ────────────────────────────────────────────── */
.divider {
  height: 1px;
  background: var(--card-border);
  margin: 0;
}

.song-card__body {
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.media-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.media-section__label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

/* ── Audio Player ────────────────────────────────────────────── */
.audio-player {
  width: 100%;
  height: 40px;
  border-radius: 10px;
  outline: none;
  accent-color: var(--accent);
  background: rgba(255, 255, 255, 0.05);
}

.audio-player::-webkit-media-controls-panel {
  background: rgba(30, 20, 60, 0.8);
}

/* ── PDF Button ──────────────────────────────────────────────── */
.btn--pdf {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(99, 102, 241, 0.2));
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: 10px;
  color: #c4b5fd;
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  width: fit-content;
}

.btn--pdf:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(99, 102, 241, 0.35));
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.3);
}

/* ── Transition ──────────────────────────────────────────────── */
.slide-fade-enter-active {
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-fade-leave-active {
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
