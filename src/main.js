import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import i18n from './i18n'
import { schemasManager } from '@/schemas/SchemasManager'

// 初始化数据管理中心
schemasManager.init();

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(i18n)
app.mount('#app')

