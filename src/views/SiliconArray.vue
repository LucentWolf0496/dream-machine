<template>
  <div class="silicon">
    <header class="silicon-header">
      <router-link to="/" class="back-link">← 返回</router-link>
      <div class="header-center">
        <h1>硅基阵</h1>
        <p>学习的过程固然艰辛，但有所提高最重要。</p>
      </div>
      <div class="header-right">
        <button v-if="isAdmin()" class="btn-add" @click="showForm = true">+ 新任务</button>
        <ThemeSwitcher />
      </div>
    </header>

    <div class="controls">
      <div class="filter-row">
        <select v-model="taskState.filterType">
          <option value="all">全部类型</option>
          <option value="homework">作业</option>
          <option value="lab">实验</option>
          <option value="project">项目</option>
          <option value="paper">论文</option>
          <option value="exam">考试</option>
        </select>
        <label class="toggle-label">
          <input type="checkbox" v-model="taskState.showCompleted" />
          显示已完成
        </label>
        <button class="btn-toggle-weights" @click="showWeights = !showWeights">
          优先级权重
        </button>
      </div>

      <div v-if="showWeights" class="weights-panel">
        <label>DDL 权重 <input type="range" min="0" max="2" step="0.1" v-model.number="weights.deadline" @input="updateW" /></label>
        <label>难度权重 <input type="range" min="0" max="2" step="0.1" v-model.number="weights.difficulty" @input="updateW" /></label>
        <label>陈旧权重 <input type="range" min="0" max="2" step="0.1" v-model.number="weights.staleness" @input="updateW" /></label>
      </div>
    </div>

    <div class="task-list">
      <TaskCard
        v-for="task in sortedTasks"
        :key="task.id"
        :task="task"
        @toggle="toggleComplete(task.id)"
        @edit="openEdit(task)"
        @delete="deleteTask(task.id)"
      />
      <p v-if="sortedTasks.length === 0" class="empty">没有符合条件的任务</p>
    </div>

    <div class="admin-bar" v-if="isAdmin()">
      <button @click="exportData">导出 JSON</button>
      <label class="import-btn">
        导入 JSON
        <input type="file" accept=".json" hidden @change="importData" />
      </label>
    </div>

    <TaskForm
      v-if="showForm"
      :editing="editingTask"
      @save="onSave"
      @close="closeForm"
    />
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { taskState, getSortedTasks, addTask, updateTask, deleteTask, toggleComplete, updateWeights } from '@/stores/tasks.js'
import { isAdmin } from '@/stores/auth.js'
import { exportJSON, importJSON } from '@/utils/storage.js'
import TaskCard from '@/components/TaskCard.vue'
import TaskForm from '@/components/TaskForm.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'

const currentTheme = inject('currentTheme')
onMounted(() => { currentTheme.value = 'silicon' })

const showForm = ref(false)
const editingTask = ref(null)
const showWeights = ref(false)
const weights = ref({ ...taskState.weights })

const sortedTasks = computed(() => getSortedTasks())

function updateW() {
  updateWeights({ ...weights.value })
}

function openEdit(task) {
  editingTask.value = task
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingTask.value = null
}

function onSave(data) {
  if (data.id) {
    updateTask(data.id, data)
  } else {
    addTask(data)
  }
  closeForm()
}

function exportData() {
  exportJSON(taskState.tasks, 'silicon-array.json')
}

async function importData(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    const data = await importJSON(file)
    taskState.tasks = data
  } catch (err) {
    alert('导入失败：JSON 格式错误')
  }
}
</script>

<style scoped>
.silicon {
  min-height: 100vh;
  padding: 24px 40px;
  max-width: 960px;
  margin: 0 auto;
}
.silicon-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.back-link {
  color: var(--accent);
  text-decoration: none;
  font-size: 14px;
}
.header-center h1 {
  font-size: 22px;
  margin-bottom: 4px;
}
.header-center p {
  font-size: 12px;
  color: var(--text-secondary);
}
.btn-add {
  padding: 6px 16px;
  background: var(--accent);
  color: var(--bg-primary);
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
}
.controls {
  margin-bottom: 20px;
}
.filter-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}
.filter-row select {
  padding: 6px 10px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 4px;
}
.toggle-label {
  font-size: 13px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn-toggle-weights {
  padding: 4px 12px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 12px;
}
.weights-panel {
  margin-top: 12px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 4px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}
.weights-panel label {
  font-size: 13px;
  color: var(--text-secondary);
}
.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.empty {
  text-align: center;
  color: var(--text-secondary);
  padding: 40px;
}
.admin-bar {
  margin-top: 32px;
  display: flex;
  gap: 12px;
}
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
