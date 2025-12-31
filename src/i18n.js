import { createI18n } from 'vue-i18n'
import en from './locales/en'
import zh from './locales/zh'
import zhTW from './locales/zh-TW'
import ja from './locales/ja'
import ko from './locales/ko'

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: 'en',  // 默认语言
  fallbackLocale: 'en',
  messages: {
    en,
    zh,
    'zh-TW': zhTW,
    ja,
    ko
  }
})

export default i18n
