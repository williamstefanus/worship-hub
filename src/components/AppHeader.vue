<template>
  <header class="app-header" role="banner">
    <!-- Logo / Brand -->
    <div class="header__brand">
      <div class="header__logo" aria-hidden="true">🎶</div>
      <div class="header__titles">
        <span class="header__app-name">Worship Hub</span>
        <span class="header__tagline">Rehearsal Center</span>
      </div>
    </div>

    <!-- Global Search Bar -->
    <div class="search-wrapper" role="search">
      <label for="global-search" class="sr-only">Search songs</label>
      <div class="search-bar">
        <svg class="search-bar__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          id="global-search"
          type="search"
          class="search-bar__input"
          placeholder="Search songs, key, or BPM…"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          autocomplete="off"
          spellcheck="false"
          aria-label="Search songs by title, key, or BPM"
        />
        <Transition name="fade">
          <button
            v-if="modelValue"
            class="search-bar__clear"
            @click="$emit('update:modelValue', '')"
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </Transition>
      </div>
    </div>

    <!-- Admin Link -->
    <RouterLink to="/admin" class="admin-link" title="Admin Panel">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
      <span class="admin-link__text">Admin</span>
    </RouterLink>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
/* ── Header Shell ────────────────────────────────────────────── */
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: var(--header-bg);
  border-bottom: 1px solid var(--card-border);
  padding: 14px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 640px) {
  .app-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 14px 32px;
  }
}

/* ── Brand ───────────────────────────────────────────────────── */
.header__brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header__logo {
  font-size: 26px;
  line-height: 1;
  filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.6));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.header__titles {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.header__app-name {
  font-family: 'Outfit', sans-serif;
  font-size: 1.15rem;
  font-weight: 800;
  background: linear-gradient(135deg, #a78bfa, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.01em;
}

.header__tagline {
  font-size: 0.68rem;
  font-weight: 500;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* ── Search Bar ──────────────────────────────────────────────── */
.search-wrapper {
  flex: 1;
  max-width: 460px;
}

@media (min-width: 640px) {
  .search-wrapper {
    margin-left: auto;
  }
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-bar__icon {
  position: absolute;
  left: 14px;
  color: var(--text-muted);
  pointer-events: none;
  flex-shrink: 0;
}

.search-bar__input {
  width: 100%;
  padding: 10px 40px 10px 42px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-bar__input::placeholder {
  color: var(--text-muted);
}

.search-bar__input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}

/* Remove native search cancel button */
.search-bar__input::-webkit-search-cancel-button {
  display: none;
}

.search-bar__clear {
  position: absolute;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 6px;
  padding: 4px;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.search-bar__clear:hover {
  background: rgba(255, 255, 255, 0.15);
  color: var(--text-primary);
}

/* Visually hidden (accessibility) */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* ── Clear fade transition ────────────────────────────────────── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ── Admin Link ──────────────────────────────────────────────── */
.admin-link {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.45);
  font-size: 0.78rem;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.admin-link:hover {
  background: rgba(124,58,237,0.15);
  border-color: rgba(124,58,237,0.4);
  color: #c4b5fd;
}

.admin-link__text { display: none; }

@media (min-width: 640px) {
  .admin-link__text { display: inline; }
}
</style>
