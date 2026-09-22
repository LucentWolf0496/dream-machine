import { createRouter, createWebHashHistory } from 'vue-router'
import { authGuard } from '@/stores/auth.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/silicon',
    name: 'SiliconArray',
    component: () => import('@/views/SiliconArray.vue')
  },
  {
    path: '/dream',
    name: 'DreamGarden',
    component: () => import('@/views/DreamGarden.vue'),
    meta: { requiredLevel: 1 }
  },
  {
    path: '/sirius',
    name: 'Sirius',
    component: () => import('@/views/Sirius.vue'),
    meta: { requiredLevel: 2 }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const required = to.meta.requiredLevel || 0
  if (authGuard(required)) {
    next()
  } else {
    window.dispatchEvent(new CustomEvent('request-password', {
      detail: { required, to }
    }))
    next(false)
  }
})

export default router
