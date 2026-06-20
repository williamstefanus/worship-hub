<template>
  <article class="song-card" :class="{ expanded: isExpanded, 'song-card--banner': variant === 'banner' }" :id="`song-card-${song.id}`">
    <!-- Card Header -->
    <div class="song-card__header" @click="toggleExpand">
      <span class="sunday-song-row__num" v-if="variant === 'banner'">{{ index + 1 }}</span>
      <div class="song-card__icon-wrap" v-else>
        <span class="song-card__icon">🎵</span>
      </div>

      <div class="song-card__info">
        <template v-if="variant === 'banner'">
          <span class="sunday-song-row__title">
            {{ song.title }}
            <span class="song-card__artist" style="opacity: 0.7; font-weight: 500; font-size: 0.85em; margin-left: 0.25rem;" v-if="song.artists?.name">&mdash; {{song.artists.name}}</span>
          </span>
        </template>
        <h2 class="song-card__title" v-else>
          {{ song.title }} 
          <span class="song-card__artist" v-if="song.artists?.name">({{song.artists.name}})</span>
        </h2>
        
        <div class="song-card__meta">
          <span class="badge badge--key" :title="`Key: ${song.key}`">
            <svg v-if="variant !== 'banner'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>
            </svg>
            {{ song.key }}
          </span>
          <span class="badge badge--bpm" :title="`Tempo: ${song.bpm} BPM`">
            <svg v-if="variant !== 'banner'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {{ song.bpm }} BPM
          </span>
        </div>
        <div class="song-card__tags" v-if="song.tags?.length && variant !== 'banner'">
          <span v-for="tag in song.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>

      <button
        v-if="variant !== 'banner'"
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

        <!-- Custom Audio Player -->
        <div class="media-section">
          <div class="media-section__label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
            Audio Guide Track
          </div>

          <!-- Hidden native audio (no controls) -->
          <audio
            v-if="song.audio_url"
            ref="audioEl"
            :src="song.audio_url"
            preload="metadata"
            :aria-label="`Audio guide for ${song.title}`"
            @timeupdate="onTimeUpdate"
            @loadedmetadata="onMetadata"
            @ended="isPlaying = false"
          />

          <!-- Custom player UI -->
          <div v-if="song.audio_url" class="audio-player-custom">
            <!-- Play / Pause -->
            <button class="ap-play-btn" @click="togglePlay" :aria-label="isPlaying ? 'Pause' : 'Play'">
              <svg v-if="!isPlaying" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
              </svg>
            </button>

            <!-- Current time -->
            <span class="ap-time">{{ formatTime(currentTime) }}</span>

            <!-- Scrubber -->
            <div class="ap-scrubber" ref="scrubberEl" @click="seek">
              <div class="ap-scrubber__track">
                <div class="ap-scrubber__fill" :style="{ width: progressPct + '%' }"/>
                <div class="ap-scrubber__thumb" :style="{ left: progressPct + '%' }"/>
              </div>
            </div>

            <!-- Duration -->
            <span class="ap-time">{{ formatTime(duration) }}</span>

            <!-- Volume control -->
            <div class="ap-volume" ref="volumeWrapEl">
              <button
                class="ap-vol-btn"
                @click.stop="toggleVolumePanel"
                :aria-label="showVolume ? 'Close volume' : 'Adjust volume'"
              >
                <!-- Muted / zero -->
                <svg v-if="isMuted || volume === 0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
                </svg>
                <!-- Low -->
                <svg v-else-if="volume < 0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
                <!-- High -->
                <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              </button>

              <!-- Vertical popup slider -->
              <Transition name="vol-popup">
                <div v-if="showVolume" class="ap-vol-popup" @click.stop>
                  <span class="ap-vol-pct">{{ Math.round((isMuted ? 0 : volume) * 100) }}%</span>
                  <input
                    type="range"
                    class="ap-vol-slider"
                    min="0" max="1" step="0.02"
                    :value="isMuted ? 0 : volume"
                    :style="{ '--vol': ((isMuted ? 0 : volume) * 100) + '' }"
                    @input="onVolumeChange"
                    aria-label="Volume"
                  />
                </div>
              </Transition>
            </div>
          </div>
          
          <div v-else class="audio-player-custom audio-player-custom--disabled">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5; margin-right: 4px;">
              <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
            No audio track available
          </div>
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

<script src="./SongCard.logic.js"></script>

<style src="../styles/components/SongCard.css" scoped></style>
