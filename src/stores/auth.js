import { reactive } from 'vue'
import { sha256 } from '@/utils/crypto.js'
import { PASSWORD_HASHES } from '@/config/passwords.js'

const ACCESS_KEY = 'dream_access_level'

export const authState = reactive({
  level: parseInt(sessionStorage.getItem(ACCESS_KEY) || '0', 10),
  lockedUntil: 0,
  failCount: 0
})

export async function tryUnlock(inputPassword, targetLevel) {
  if (authState.level >= targetLevel) return true

  // 防暴力：锁定检查
  if (Date.now() < authState.lockedUntil) {
    return { locked: true, remaining: Math.ceil((authState.lockedUntil - Date.now()) / 1000) }
  }

  const hashed = await sha256(inputPassword)
  let matched = false

  if (targetLevel === 1 && hashed === PASSWORD_HASHES.lucent) matched = true
  if (targetLevel === 2 && hashed === PASSWORD_HASHES.deep) matched = true
  if (targetLevel === 3 && hashed === PASSWORD_HASHES.admin) matched = true

  if (matched) {
    authState.level = Math.max(authState.level, targetLevel)
    sessionStorage.setItem(ACCESS_KEY, String(authState.level))
    authState.failCount = 0
    return true
  }

  // 失败计数与锁定
  authState.failCount++
  if (authState.failCount >= 5) {
    authState.lockedUntil = Date.now() + 30000
    return { locked: true, remaining: 30 }
  }
  return false
}

export function authGuard(requiredLevel) {
  return authState.level >= requiredLevel
}

export function isAdmin() {
  return authState.level >= 3
}
