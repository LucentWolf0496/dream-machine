<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-card" :class="{ shake: shaking }">
        <h3>{{ titleText }}</h3>
        <p class="hint">{{ hintText }}</p>
        <input
          ref="inputRef"
          v-model="password"
          type="password"
          :placeholder="placeholderText"
          @keydown.enter="submit"
        />
        <div class="modal-actions">
          <button class="btn-submit" @click="submit">确认</button>
          <button class="btn-cancel" @click="close">取消</button>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { tryUnlock } from '@/stores/auth.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const visible = ref(false)
const password = ref('')
const required = ref(0)
const targetRoute = ref(null)
const error = ref('')
const shaking = ref(false)
const inputRef = ref(null)

const titleText = computed(() => {
  if (required.value === 1) return '入梦园 — 请输入密码'
  if (required.value === 2) return '天狼星 — 请输入密码'
  return '管理员模式 — 请输入密码'
})

const hintText = computed(() => {
  if (required.value === 1) return '解锁灵感花园'
  if (required.value === 2) return '解锁深层星系'
  return '解锁编辑权限'
})

const placeholderText = computed(() => {
  if (required.value === 3) return '混沌强密码'
  return '输入密码…'
})

function show(event) {
  required.value = event.detail.required
  targetRoute.value = event.detail.to
  error.value = ''
  password.value = ''
  visible.value = true
  nextTick(() => inputRef.value?.focus())
}

function close() {
  visible.value = false
}

async function submit() {
  if (!password.value) return
  const result = await tryUnlock(password.value, required.value)
  if (result === true) {
    visible.value = false
    if (targetRoute.value) {
      router.push(targetRoute.value.path)
    }
  } else if (result && result.locked) {
    error.value = `已锁定，请等待 ${result.remaining} 秒`
    triggerShake()
  } else {
    error.value = '密码错误'
    triggerShake()
  }
}

function triggerShake() {
  shaking.value = true
  setTimeout(() => { shaking.value = false }, 500)
}

function onRequestPassword(e) {
  show(e)
}

onMounted(() => {
  window.addEventListener('request-password', onRequestPassword)
})

onUnmounted(() => {
  window.removeEventListener('request-password', onRequestPassword)
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}
.modal-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--card-radius, 8px);
  padding: 32px 40px;
  min-width: 360px;
  box-shadow: var(--glow);
}
.modal-card h3 {
  margin-bottom: 8px;
  font-size: 16px;
}
.hint {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 16px;
}
.modal-card input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
}
.modal-card input:focus {
  border-color: var(--accent);
  box-shadow: var(--glow);
}
.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}
.btn-submit {
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
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-radius: 4px;
}
.error {
  color: var(--danger);
  font-size: 12px;
  margin-top: 10px;
}
.shake {
  animation: shake 0.4s ease-in-out;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}
</style>
