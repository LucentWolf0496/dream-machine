<template>
  <div class="task-card" :class="{ completed: task.completed }">
    <div class="card-left">
      <input
        type="checkbox"
        :checked="task.completed"
        @change="$emit('toggle')"
      />
      <div class="task-info">
        <span class="task-name">{{ task.name }}</span>
        <span class="task-meta">{{ task.course }} · {{ typeLabel }} · 难度 {{ task.difficulty }}/10</span>
      </div>
    </div>
    <div class="card-right">
      <span class="ddl" :class="{ urgent: daysLeft <= 3, warning: daysLeft > 3 && daysLeft <= 7 }">
        {{ ddlText }}
      </span>
      <span class="priority-badge">{{ score }}</span>
      <div v-if="isAdmin()" class="card-actions">
        <button class="btn-edit" @click="$emit('edit')" title="编辑">✎</button>
        <button class="btn-delete" @click="$emit('delete')" title="删除">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { computePriority } from '@/utils/priority.js'
import { isAdmin } from '@/stores/auth.js'

const props = defineProps({ task: Object })
defineEmits(['toggle', 'edit', 'delete'])

const typeLabel = computed(() => {
  const map = { homework: '作业', lab: '实验', project: '项目', paper: '论文', exam: '考试' }
  return map[props.task.type] || props.task.type
})

const daysLeft = computed(() => {
  return Math.ceil((new Date(props.task.ddl).getTime() - Date.now()) / (24 * 3600 * 1000))
})

const ddlText = computed(() => {
  const d = daysLeft.value
  if (d < 0) return `已逾期 ${-d} 天`
  if (d === 0) return '今天截止'
  return `还剩 ${d} 天`
})

const score = computed(() => {
  return Math.round(computePriority(props.task))
})
</script>

<style scoped>
.task-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--card-radius);
  transition: border-color 0.2s;
}
.task-card:hover {
  border-color: var(--accent);
}
.task-card.completed {
  opacity: 0.5;
}
.task-card.completed .task-name {
  text-decoration: line-through;
}
.card-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.card-left input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--accent);
}
.task-name {
  font-size: 14px;
  font-weight: 500;
}
.task-meta {
  font-size: 11px;
  color: var(--text-secondary);
  display: block;
  margin-top: 2px;
}
.card-right {
  display: flex;
  align-items: center;
  gap: 14px;
}
.ddl {
  font-size: 12px;
  color: var(--text-secondary);
}
.ddl.urgent {
  color: var(--danger);
}
.ddl.warning {
  color: var(--warning);
}
.priority-badge {
  background: var(--accent-dim);
  color: var(--accent);
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 32px;
  text-align: center;
}
.card-actions {
  display: flex;
  gap: 4px;
}
.btn-edit, .btn-delete {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  padding: 2px 6px;
}
.btn-edit:hover { color: var(--accent); }
.btn-delete:hover { color: var(--danger); }
</style>
