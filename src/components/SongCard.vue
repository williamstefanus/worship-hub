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
            v-if="song.pdf_url"
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
          <span
            v-else
            class="btn btn--pdf btn--disabled"
            title="No chord chart available for this song"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            No Chart Available
          </span>
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

<style src="../styles/components/SongCard.css" scoped></style>
