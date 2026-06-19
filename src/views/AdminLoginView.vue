<template>
  <div class="login-wrapper">
    <div class="login-card glass">
      <!-- Logo -->
      <div class="login-logo">
        <span class="logo-icon">🎵</span>
        <h1 class="logo-text">Worship <span class="gradient-text">Hub</span></h1>
      </div>

      <h2 class="login-title">Admin Login</h2>
      <p class="login-subtitle">Sign in to manage the song library</p>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="field-group">
          <label for="email" class="field-label">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="field-input"
            placeholder="admin@example.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="field-group">
          <label for="password" class="field-label">Password</label>
          <div class="password-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="field-input"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            />
            <button type="button" class="toggle-pw" @click="showPassword = !showPassword" aria-label="Toggle password visibility">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <!-- Error message -->
        <Transition name="fade">
          <div v-if="errorMsg" class="error-alert" role="alert">
            ⚠️ {{ errorMsg }}
          </div>
        </Transition>

        <button
          id="login-submit"
          type="submit"
          class="btn-login"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner"></span>
          <span>{{ loading ? 'Signing in…' : 'Sign In' }}</span>
        </button>
      </form>

      <RouterLink to="/" class="back-link">← Back to Song Library</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase.js'

const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  loading.value = true
  errorMsg.value = ''

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  loading.value = false

  if (error) {
    errorMsg.value = error.message
  } else {
    router.push('/admin')
  }
}
</script>

<style src="../styles/views/AdminLoginView.css" scoped></style>
