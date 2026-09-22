<template>
  <div class="dream">
    <header class="dream-header">
      <router-link to="/" class="back-link">← 返回</router-link>
      <div class="header-center">
        <h1>入梦园</h1>
        <p>回到大地的飞行，飞入心中的梦。</p>
      </div>
      <div class="header-right">
        <button v-if="isAdmin()" class="btn-add" @click="addNewTree">+ 新灵感树</button>
        <ThemeSwitcher />
      </div>
    </header>

    <div class="tree-grid">
      <div
        v-for="tree in dreamState.trees"
        :key="tree.id"
        class="tree-preview"
        @click="selectedTree = tree"
      >
        <div class="preview-icon">✿</div>
        <div class="preview-label">{{ tree.root.content.slice(0, 24) }}{{ tree.root.content.length > 24 ? '…' : '' }}</div>
        <div class="preview-meta">{{ childCount(tree.root) }} 个延伸</div>
      </div>
    </div>

    <div v-if="selectedTree" class="tree-detail-overlay" @click.self="selectedTree = null">
      <div class="tree-detail">
        <div class="detail-header">
          <h3>{{ selectedTree.root.content }}</h3>
          <button class="btn-close" @click="selectedTree = null">✕</button>
        </div>
        <DreamTree :tree="selectedTree" />
        <div v-if="isAdmin()" class="detail-actions">
          <button @click="deleteTree(selectedTree.id)">删除此树</button>
        </div>
      </div>
    </div>

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
import { ref, inject, onMounted } from 'vue'
import { dreamState, addTree, deleteTree } from '@/stores/dreams.js'
import { isAdmin } from '@/stores/auth.js'
import { exportJSON, importJSON } from '@/utils/storage.js'
import DreamTree from '@/components/DreamTree.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'

const currentTheme = inject('currentTheme')
onMounted(() => { currentTheme.value = 'dream' })

const selectedTree = ref(null)

function childCount(node) {
  let count = node.children?.length || 0
  if (node.children) {
    node.children.forEach(c => { count += childCount(c) })
  }
  return count
}

function addNewTree() {
  const tree = addTree('fairy_town')
  selectedTree.value = tree
}

function exportData() {
  exportJSON(dreamState.trees, 'dream-garden.json')
}

async function importData(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    const data = await importJSON(file)
    dreamState.trees = data
  } catch { alert('导入失败') }
}
</script>

<style scoped>
.dream {
  min-height: 100vh;
  padding: 24px 40px;
  max-width: 960px;
  margin: 0 auto;
}
.dream-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}
.back-link { color: var(--accent); text-decoration: none; font-size: 14px; }
.header-center h1 { font-size: 22px; margin-bottom: 4px; }
.header-center p { font-size: 12px; color: var(--text-secondary); }
.btn-add {
  padding: 6px 16px;
  background: var(--accent);
  color: var(--bg-primary);
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
}
.tree-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.tree-preview {
  padding: 20px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--card-radius);
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
  text-align: center;
}
.tree-preview:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
}
.preview-icon { font-size: 28px; margin-bottom: 8px; }
.preview-label {
  font-size: 14px;
  margin-bottom: 4px;
}
.preview-meta { font-size: 11px; color: var(--text-secondary); }
.tree-detail-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.tree-detail {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--card-radius);
  padding: 24px;
  max-width: 960px;
  width: 90vw;
  max-height: 85vh;
  overflow: auto;
}
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.detail-header h3 { font-size: 16px; max-width: 85%; }
.btn-close { background: transparent; border: none; color: var(--text-secondary); font-size: 18px; }
.detail-actions { margin-top: 16px; }
.detail-actions button {
  padding: 6px 14px;
  background: transparent;
  border: 1px solid var(--danger);
  border-radius: 4px;
  color: var(--danger);
  font-size: 12px;
}
.admin-bar { margin-top: 32px; display: flex; gap: 12px; }
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
