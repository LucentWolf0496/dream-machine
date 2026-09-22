<template>
  <div :data-theme="currentTheme" class="app-root">
    <router-view />
    <PasswordModal />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import PasswordModal from '@/components/PasswordModal.vue'

const currentTheme = ref('silicon')
provide('currentTheme', currentTheme)

window.addEventListener('set-theme', (e) => {
  currentTheme.value = e.detail.theme
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Nunito:wght@400;600;700&family=Orbitron:wght@400;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app, .app-root {
  width: 100%;
  min-height: 100vh;
}

.app-root {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font);
  transition: background 0.4s, color 0.4s;
}

button {
  cursor: pointer;
  font-family: inherit;
}

input, select, textarea {
  font-family: inherit;
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: var(--bg-primary);
}
::-webkit-scrollbar-thumb {
  background: var(--accent-dim);
  border-radius: 3px;
}
</style>
