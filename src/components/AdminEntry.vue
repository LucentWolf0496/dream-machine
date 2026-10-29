<template>
  <button class="admin-entry" :class="{ unlocked }" @click="requestAdmin">
    {{ unlocked ? '管理员已解锁' : '管理员模式' }}
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { authState } from '@/stores/auth.js'

const unlocked = computed(() => authState.level >= 3)

function requestAdmin() {
  if (unlocked.value) return
  window.dispatchEvent(new CustomEvent('request-password', {
    detail: { required: 3, to: null }
  }))
}
</script>

<style scoped>
.admin-entry {
  padding: 4px 12px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 12px;
  transition: color 0.2s, border-color 0.2s;
}
.admin-entry:hover {
  color: var(--accent);
  border-color: var(--accent);
}
.admin-entry.unlocked {
  color: var(--success);
  border-color: var(--success);
  cursor: default;
}
</style>
