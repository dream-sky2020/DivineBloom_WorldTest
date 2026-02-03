import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import i18n from './i18n'
import { schemasManager } from '@/schemas/SchemasManager'

// 初始化数据管理中心
// schemasManager.init(); // Init is called implicitly or we can call it here, but we need to load project data first

const initApp = async () => {
    // 1. Load Project Data (replaces static map imports)
    // await schemasManager.loadProjectData('/scenedate.json');
    
    // 2. Init other schemas
    schemasManager.init();

    const pinia = createPinia()
    const app = createApp(App)

    app.use(pinia)
    app.use(i18n)
    app.mount('#app')
}

initApp();

