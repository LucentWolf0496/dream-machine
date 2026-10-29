// 密码哈希通过构建时环境变量注入，源码中不保存真实哈希。
// 本地开发：在 .env.local 中设置 VITE_LUCENT_HASH / VITE_DEEP_HASH / VITE_ADMIN_HASH
// GitHub Pages：在仓库 Settings -> Secrets and variables -> Actions 中添加同名 secret
export const PASSWORD_HASHES = {
  lucent: import.meta.env.VITE_LUCENT_HASH || '',
  deep: import.meta.env.VITE_DEEP_HASH || '',
  admin: import.meta.env.VITE_ADMIN_HASH || ''
}

export function isPasswordConfigured(level) {
  const key = level === 1 ? 'lucent' : level === 2 ? 'deep' : 'admin'
  return /^[a-f0-9]{64}$/i.test(PASSWORD_HASHES[key] || '')
}
