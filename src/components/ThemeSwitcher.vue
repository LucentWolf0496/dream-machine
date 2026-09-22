<template>
  <div v-if="isAdmin()" class="theme-switcher">
    <button
      v-for="t in themes"
      :key="t.value"
      :class="{ active: t.value === currentTheme }"
      @click="switchTheme(t.value)"
    >
      {{ t.label }}
    </button>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { isAdmin } from '@/stores/auth.js'

const currentTheme = inject('currentTheme')

const themes = [
  { value: 'silicon', label: '硅基' },
  { value: 'dream', label: '入梦' },
  { value: 'sirius', label: '天狼' }
]

function switchTheme(theme) {
  currentTheme.value = theme
  window.dispatchEvent(new CustomEvent('set-theme', { detail: { theme } }))
}
</script>

<style scoped>
.theme-switcher {
  display: flex;
  gap: 8px;
}
.theme-switcher button {
  padding: 4px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
}
.theme-switcher button.active {
  background: var(--accent-dim);
  color: var(--accent);
  border-color: var(--accent);
}
</style>
