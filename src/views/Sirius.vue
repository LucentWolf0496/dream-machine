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
        <AdminEntry />
        <ThemeSwitcher />
      </div>
    </header>

    <div v-if="isAdmin()" class="graph-toolbar">
      <button class="btn-add-node" @click="createNode">+ 新节点</button>
      <span class="toolbar-hint">点击节点或连线进行编辑</span>
    </div>

    <SiriusGraph
      :data="siriusData"
      @node-click="openNodeEditor"
      @link-click="openLinkEditor"
    />

    <div class="admin-bar" v-if="isAdmin()">
      <button @click="exportData">导出 JSON</button>
      <label class="import-btn">
        导入 JSON
        <input type="file" accept=".json" hidden @change="importData" />
      </label>
    </div>

    <div v-if="editor" class="editor-overlay" @click.self="closeEditor">
      <div class="editor-card">
        <template v-if="editor.type === 'node'">
          <h3>节点编辑</h3>
          <label>名称 <input v-model="nodeDraft.label" /></label>
          <label>
            类别
            <select v-model="nodeDraft.category">
              <option value="personality">人格</option>
              <option value="life">生命思考</option>
              <option value="inner">内心世界</option>
              <option value="writing">创作</option>
              <option value="other">其他</option>
            </select>
          </label>
          <label>
            大小 <span class="size-val">{{ nodeDraft.size }}</span>
            <input type="range" min="10" max="50" v-model.number="nodeDraft.size" />
          </label>
          <label class="check-row">
            <input type="checkbox" v-model="nodeDraft.locked" />
            锁定此节点
          </label>

          <div class="link-creator">
            <span class="sub-title">新增连线</span>
            <select v-model="newLinkTarget">
              <option value="">选择目标节点…</option>
              <option v-for="n in linkTargets" :key="n.id" :value="n.id">{{ n.label }}</option>
            </select>
            <input v-model="newLinkLabel" placeholder="关系说明（可选）" />
            <button @click="addLinkFromNode">建立连线</button>
          </div>

          <div class="editor-actions">
            <button class="btn-save" @click="saveNode">保存</button>
            <button class="btn-cancel" @click="closeEditor">取消</button>
            <button class="btn-delete" @click="removeNode">删除节点</button>
          </div>
        </template>

        <template v-else>
          <h3>连线编辑</h3>
          <p class="link-route">{{ linkDraft.sourceLabel }} → {{ linkDraft.targetLabel }}</p>
          <label>关系说明 <input v-model="linkDraft.label" /></label>
          <label class="check-row">
            <input type="checkbox" v-model="linkDraft.locked" />
            锁定此连线
          </label>
          <div class="editor-actions">
            <button class="btn-save" @click="saveLink">保存</button>
            <button class="btn-cancel" @click="closeEditor">取消</button>
            <button class="btn-delete" @click="removeLink">删除连线</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, reactive, computed } from 'vue'
import { isAdmin } from '@/stores/auth.js'
import { loadData, saveData, exportJSON, importJSON } from '@/utils/storage.js'
import defaultSirius from '@/data/sirius.json'
import SiriusGraph from '@/components/SiriusGraph.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import AdminEntry from '@/components/AdminEntry.vue'

const currentTheme = inject('currentTheme')
onMounted(() => { currentTheme.value = 'sirius' })

const mood = ref('calm')
const siriusData = reactive(loadData('dream_sirius', defaultSirius))

const editor = ref(null)
const nodeDraft = reactive({ label: '', category: 'personality', size: 20, locked: false })
const linkDraft = reactive({ label: '', locked: false, sourceLabel: '', targetLabel: '' })
const newLinkTarget = ref('')
const newLinkLabel = ref('')

const linkTargets = computed(() => {
  if (!editor.value || editor.value.type !== 'node') return []
  return siriusData.nodes.filter(n => n.id !== editor.value.id)
})

function linkEndId(end) {
  return typeof end === 'object' && end !== null ? end.id : end
}

function persist() {
  saveData('dream_sirius', {
    nodes: siriusData.nodes.map(({ id, label, category, locked, size }) => ({
      id, label, category, locked: !!locked, size
    })),
    links: siriusData.links.map(l => ({
      source: linkEndId(l.source),
      target: linkEndId(l.target),
      label: l.label || '',
      locked: !!l.locked
    }))
  })
}

function toggleMood() {
  mood.value = mood.value === 'calm' ? 'broken' : 'calm'
}

function openNodeEditor(id) {
  if (!isAdmin()) return
  const node = siriusData.nodes.find(n => n.id === id)
  if (!node) return
  Object.assign(nodeDraft, {
    label: node.label,
    category: node.category || 'other',
    size: node.size || 20,
    locked: !!node.locked
  })
  newLinkTarget.value = ''
  newLinkLabel.value = ''
  editor.value = { type: 'node', id }
}

function openLinkEditor(index) {
  if (!isAdmin()) return
  const link = siriusData.links[index]
  if (!link) return
  const source = siriusData.nodes.find(n => n.id === linkEndId(link.source))
  const target = siriusData.nodes.find(n => n.id === linkEndId(link.target))
  Object.assign(linkDraft, {
    label: link.label || '',
    locked: !!link.locked,
    sourceLabel: source?.label || linkEndId(link.source),
    targetLabel: target?.label || linkEndId(link.target)
  })
  editor.value = { type: 'link', index }
}

function closeEditor() {
  editor.value = null
}

function createNode() {
  const id = 'n_' + Date.now()
  siriusData.nodes.push({
    id,
    label: '新星',
    category: 'other',
    locked: false,
    size: 20
  })
  persist()
  openNodeEditor(id)
}

function saveNode() {
  const node = siriusData.nodes.find(n => n.id === editor.value?.id)
  if (!node) return
  Object.assign(node, { ...nodeDraft })
  persist()
  closeEditor()
}

function addLinkFromNode() {
  if (!editor.value || !newLinkTarget.value) return
  const sourceId = editor.value.id
  const targetId = newLinkTarget.value
  const exists = siriusData.links.some(l => {
    const a = linkEndId(l.source)
    const b = linkEndId(l.target)
    return (a === sourceId && b === targetId) || (a === targetId && b === sourceId)
  })
  if (exists) {
    alert('这条连线已经存在')
    return
  }
  siriusData.links.push({
    source: sourceId,
    target: targetId,
    label: newLinkLabel.value.trim(),
    locked: false
  })
  persist()
  newLinkTarget.value = ''
  newLinkLabel.value = ''
}

function removeNode() {
  if (!editor.value) return
  const id = editor.value.id
  siriusData.nodes = siriusData.nodes.filter(n => n.id !== id)
  siriusData.links = siriusData.links.filter(
    l => linkEndId(l.source) !== id && linkEndId(l.target) !== id
  )
  persist()
  closeEditor()
}

function saveLink() {
  const link = siriusData.links[editor.value?.index]
  if (!link) return
  link.label = linkDraft.label
  link.locked = linkDraft.locked
  persist()
  closeEditor()
}

function removeLink() {
  if (!editor.value) return
  siriusData.links.splice(editor.value.index, 1)
  persist()
  closeEditor()
}

function exportData() {
  exportJSON(siriusData, 'sirius.json')
}

async function importData(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    const data = await importJSON(file)
    siriusData.nodes = Array.isArray(data.nodes) ? data.nodes : []
    siriusData.links = Array.isArray(data.links) ? data.links : []
    persist()
  } catch {
    alert('导入失败：JSON 格式错误')
  }
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
.sirius[data-mood="broken"] {
  --broken-tint: rgba(180, 50, 50, 0.15);
  background: radial-gradient(ellipse at center, #0a0515 0%, #150510 40%, #050510 100%);
}
.graph-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.btn-add-node {
  padding: 6px 16px;
  background: var(--accent);
  color: var(--bg-primary);
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
}
.toolbar-hint {
  font-size: 12px;
  color: var(--text-secondary);
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
.editor-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  backdrop-filter: blur(3px);
}
.editor-card {
  width: 420px;
  max-width: 92vw;
  max-height: 88vh;
  overflow: auto;
  padding: 24px 28px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--card-radius);
  box-shadow: var(--glow);
}
.editor-card h3 {
  margin-bottom: 16px;
  font-size: 16px;
}
.editor-card label {
  display: block;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--text-secondary);
}
.editor-card input,
.editor-card select {
  display: block;
  width: 100%;
  margin-top: 5px;
  padding: 8px 10px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 13px;
}
.editor-card input[type="range"] {
  padding: 0;
  accent-color: var(--accent);
}
.check-row {
  display: flex !important;
  align-items: center;
  gap: 8px;
}
.check-row input {
  width: auto !important;
  margin: 0 !important;
  accent-color: var(--accent);
}
.size-val {
  float: right;
  color: var(--accent);
}
.link-creator {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px dashed var(--border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sub-title {
  font-size: 12px;
  color: var(--accent);
}
.link-creator input,
.link-creator select {
  margin-top: 0;
}
.link-creator button {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--accent);
  border-radius: 4px;
  color: var(--accent);
  font-size: 12px;
}
.link-route {
  margin-bottom: 14px;
  font-size: 13px;
  color: var(--text-secondary);
  word-break: break-all;
}
.editor-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
.btn-save {
  flex: 1;
  padding: 8px;
  background: var(--accent);
  color: var(--bg-primary);
  border: none;
  border-radius: 4px;
  font-weight: 600;
}
.btn-cancel {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-secondary);
}
.btn-delete {
  padding: 8px 14px;
  background: transparent;
  border: 1px solid var(--danger);
  border-radius: 4px;
  color: var(--danger);
}
</style>
