<template>
  <div class="home">
    <header class="hero">
      <h1 class="title">造梦机</h1>
      <p class="subtitle">因为喜欢做梦，而世界越来越缺少梦幻，所以造梦。</p>
    </header>
    <nav class="layers">
      <router-link to="/silicon" class="layer-card silicon-card">
        <span class="layer-icon">◈</span>
        <span class="layer-name">硅基阵</span>
        <span class="layer-desc">学习计划表 — 清晰·实用·高效</span>
      </router-link>
      <button class="layer-card dream-card" @click="enterDream">
        <span class="layer-icon">✿</span>
        <span class="layer-name">入梦园</span>
        <span class="layer-desc">灵感记录 — 童话小镇风</span>
      </button>
      <button class="layer-card sirius-card" @click="enterSirius">
        <span class="layer-icon">✦</span>
        <span class="layer-name">天狼星</span>
        <span class="layer-desc">情绪收集 — 太空宇宙风</span>
      </button>
    </nav>
    <footer class="footer">
      <ThemeSwitcher />
    </footer>
  </div>
</template>

<script setup>
import { inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authGuard, isAdmin } from '@/stores/auth.js'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'

const router = useRouter()
const currentTheme = inject('currentTheme')

onMounted(() => {
  currentTheme.value = 'silicon'
})

function enterDream() {
  if (authGuard(1)) {
    router.push('/dream')
  } else {
    window.dispatchEvent(new CustomEvent('request-password', {
      detail: { required: 1, to: { path: '/dream' } }
    }))
  }
}

function enterSirius() {
  if (authGuard(2)) {
    router.push('/sirius')
  } else {
    window.dispatchEvent(new CustomEvent('request-password', {
      detail: { required: 2, to: { path: '/sirius' } }
    }))
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}
.hero {
  text-align: center;
  margin-bottom: 60px;
}
.title {
  font-size: 48px;
  font-weight: 700;
  letter-spacing: 0.15em;
  margin-bottom: 12px;
}
.subtitle {
  color: var(--text-secondary);
  font-size: 15px;
  letter-spacing: 0.05em;
}
.layers {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
}
.layer-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 36px;
  border: 1px solid var(--border);
  border-radius: var(--card-radius, 8px);
  background: var(--card-bg);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
  min-width: 200px;
}
.layer-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--glow);
}
.layer-icon {
  font-size: 32px;
}
.layer-name {
  font-size: 18px;
  font-weight: 600;
}
.layer-desc {
  font-size: 12px;
  color: var(--text-secondary);
}
.silicon-card:hover {
  border-color: #00d4ff;
}
.dream-card:hover {
  border-color: #e07a5f;
}
.sirius-card:hover {
  border-color: #a78bfa;
}
.footer {
  margin-top: 60px;
}
</style>
