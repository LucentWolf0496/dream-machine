<template>
  <div class="sirius" :data-mood="mood">
    <header class="sirius-header">
      <router-link to="/" class="back-link">← 返回</router-link>
      <div class="header-center">
        <h1>天狼星</h1>
        <p>我强烈地感觉到我不属于这个世界。我来自天狼星。</p>
      </div>
      <div class="header-right">
        <button class="btn-mood" @click="toggleMood">
          {{ mood === 'calm' ? '崩坏' : '平静' }}
        </button>
        <ThemeSwitcher />
      </div>
    </header>

    <SiriusGraph :data="siriusData" />

    <div class="admin-bar" v-if="isAdmin()">
      <button @click="exportData">导出 JSON</button>
      <label class="import-btn">
        导入 JSON
        <input type="file" accept=".json" hidden @change="importData" />
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, reactive } from 'vue'
import { isAdmin } from '@/stores/auth.js'
import { loadData, saveData, exportJSON, importJSON } from '@/utils/storage.js'
import defaultSirius from '@/data/sirius.json'
import SiriusGraph from '@/components/SiriusGraph.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'

const currentTheme = inject('currentTheme')
onMounted(() => { currentTheme.value = 'sirius' })

const mood = ref('calm')
const siriusData = reactive(loadData('dream_sirius', defaultSirius))

function toggleMood() {
  mood.value = mood.value === 'calm' ? 'broken' : 'calm'
}

function exportData() {
  exportJSON(siriusData, 'sirius.json')
}

async function importData(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    const data = await importJSON(file)
    Object.assign(siriusData, data)
    saveData('dream_sirius', { ...siriusData })
  } catch { alert('导入失败') }
}
</script>

<style scoped>
.sirius {
  min-height: 100vh;
  padding: 24px 40px;
  max-width: 1100px;
  margin: 0 auto;
}
.sirius-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.back-link { color: var(--accent); text-decoration: none; font-size: 14px; }
.header-center h1 { font-size: 22px; margin-bottom: 4px; }
.header-center p { font-size: 12px; color: var(--text-secondary); }
.btn-mood {
  padding: 4px 14px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 12px;
}
\n[data-mood="broken"] {
  --broken-tint: rgba(180, 50, 50, 0.15);
}
[data-mood="broken"] .sirius {
  background: radial-gradient(ellipse at center, #0a0515 0%, #150510 40%, #050510 100%);
}
.admin-bar { margin-top: 24px; display: flex; gap: 12px; }
.admin-bar button, .import-btn {
  padding: 6px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
}
</style>
