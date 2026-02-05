import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import i18n from './i18n'

const initApp = async () => {
    const pinia = createPinia()
    const app = createApp(App)

    app.use(pinia)
    app.use(i18n)
    app.mount('#app')
}

initApp();
