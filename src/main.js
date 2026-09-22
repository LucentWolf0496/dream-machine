import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './assets/themes/silicon.css'
import './assets/themes/dream.css'
import './assets/themes/sirius.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
