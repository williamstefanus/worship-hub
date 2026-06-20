<template>
  <header class="app-header" role="banner">
    <!-- Logo / Brand -->
    <RouterLink to="/" class="header__brand" aria-label="Worship Hub — go to song list">
      <div class="header__logo" aria-hidden="true">✝️</div>
      <div class="header__titles">
        <span class="header__app-name">Worship Hub</span>
        <span class="header__tagline">Rehearsal Center</span>
      </div>
    </RouterLink>

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

<style src="../styles/components/AppHeader.css" scoped></style>
