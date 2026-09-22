import { reactive } from 'vue'
import { loadData, saveData } from '@/utils/storage.js'
import { sortTasks } from '@/utils/priority.js'
import defaultTasks from '@/data/silicon-array.json'

const STORAGE_KEY = 'dream_tasks'

export const taskState = reactive({
  tasks: loadData(STORAGE_KEY, defaultTasks),
  weights: loadData('dream_task_weights', { deadline: 1.0, difficulty: 0.6, staleness: 0.4 }),
  filterType: 'all',
  showCompleted: false
})

export function getSortedTasks() {
  let list = [...taskState.tasks]
  if (taskState.filterType !== 'all') {
    list = list.filter(t => t.type === taskState.filterType)
  }
  if (!taskState.showCompleted) {
    list = list.filter(t => !t.completed)
  }
  return sortTasks(list, taskState.weights)
}

export function addTask(task) {
  const newTask = {
    ...task,
    id: 'task_' + Date.now(),
    createdAt: new Date().toISOString(),
    completed: false
  }
  taskState.tasks.push(newTask)
  persist()
}

export function updateTask(id, updates) {
  const idx = taskState.tasks.findIndex(t => t.id === id)
  if (idx >= 0) {
    taskState.tasks[idx] = { ...taskState.tasks[idx], ...updates }
    persist()
  }
}

export function deleteTask(id) {
  taskState.tasks = taskState.tasks.filter(t => t.id !== id)
  persist()
}

export function toggleComplete(id) {
  const task = taskState.tasks.find(t => t.id === id)
  if (task) {
    task.completed = !task.completed
    persist()
  }
}

export function updateWeights(weights) {
  taskState.weights = { ...weights }
  saveData('dream_task_weights', taskState.weights)
}

function persist() {
  saveData(STORAGE_KEY, taskState.tasks)
}
