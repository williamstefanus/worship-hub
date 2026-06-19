<template>
  <div class="app-shell">
    <!-- Ambient background orbs -->
    <div class="bg-orb bg-orb--rose" aria-hidden="true"></div>
    <div class="bg-orb bg-orb--orange" aria-hidden="true"></div>

    <RouterView />
    <AppFooter />
  </div>
</template>

<script setup>
import AppFooter from './components/AppFooter.vue'
</script>

<style src="./styles/base/App.css" scoped></style>
