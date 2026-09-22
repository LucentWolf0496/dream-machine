<template>
  <div class="form-overlay" @click.self="$emit('close')">
    <div class="form-card">
      <h3>{{ editing ? '编辑任务' : '新增任务' }}</h3>
      <label>任务名称 <input v-model="form.name" /></label>
      <label>课程 <input v-model="form.course" /></label>
      <label>
        类型
        <select v-model="form.type">
          <option value="homework">作业</option>
          <option value="lab">实验</option>
          <option value="project">项目</option>
          <option value="paper">论文</option>
          <option value="exam">考试</option>
        </select>
      </label>
      <label>
        难度 <span class="diff-val">{{ form.difficulty }}/10</span>
        <input type="range" min="1" max="10" v-model.number="form.difficulty" />
      </label>
      <label>截止日期 <input type="datetime-local" v-model="form.ddlLocal" /></label>
      <label>备注 <textarea v-model="form.notes" rows="2"></textarea></label>
      <div class="form-actions">
        <button class="btn-save" @click="save">保存</button>
        <button class="btn-cancel" @click="$emit('close')">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'

const props = defineProps({ editing: Object })
const emit = defineEmits(['save', 'close'])

function toLocalISO(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

const form = reactive({
  id: props.editing?.id || null,
  name: props.editing?.name || '',
  course: props.editing?.course || '',
  type: props.editing?.type || 'homework',
  difficulty: props.editing?.difficulty || 5,
  ddlLocal: toLocalISO(props.editing?.ddl || new Date(Date.now() + 7*24*3600*1000).toISOString()),
  notes: props.editing?.notes || ''
})

function save() {
  const d = new Date(form.ddlLocal)
  emit('save', {
    id: form.id,
    name: form.name,
    course: form.course,
    type: form.type,
    difficulty: form.difficulty,
    ddl: d.toISOString(),
    notes: form.notes
  })
}
</script>

<style scoped>
.form-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.form-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--card-radius);
  padding: 28px 32px;
  min-width: 400px;
  max-width: 480px;
  box-shadow: var(--glow);
}
.form-card h3 {
  margin-bottom: 16px;
  font-size: 16px;
}
.form-card label {
  display: block;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--text-secondary);
}
.form-card input, .form-card select, .form-card textarea {
  display: block;
  width: 100%;
  margin-top: 4px;
  padding: 8px 10px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 13px;
}
.diff-val {
  float: right;
  color: var(--accent);
  font-size: 12px;
}
.form-card input[type="range"] {
  padding: 0;
  accent-color: var(--accent);
}
.form-actions {
  display: flex;
  gap: 12px;
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
</style>
