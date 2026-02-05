import { createI18n } from 'vue-i18n'
import en from './locales/en'
import zh from './locales/zh'
import zhTW from './locales/zh-TW'
import ja from './locales/ja'
import ko from './locales/ko'
import ui from './locales/ui'
import dialogue from './locales/dialogue'

// Helper to transform "Key -> Locale -> Text" to "Locale -> Key -> Text"
function transformUiToMessages(uiData: any) {
  const messages: Record<string, any> = {};
  const supportedLocales = ['en', 'zh', 'zh-TW', 'ja', 'ko'];

  function traverse(currentObj: any, path: string[] = []) {
    for (const key in currentObj) {
      const value = currentObj[key];
      // Check if this value is a translation leaf (contains locale keys)
      const isLeaf = typeof value === 'object' && value !== null &&
        supportedLocales.some(locale => locale in value);

      if (isLeaf) {
        for (const locale in value) {
          if (!messages[locale]) messages[locale] = {};

          let currentLevel = messages[locale];
          for (let i = 0; i < path.length; i++) {
            const pathKey = path[i];
            if (!currentLevel[pathKey]) currentLevel[pathKey] = {};
            currentLevel = currentLevel[pathKey];
          }
          currentLevel[key] = value[locale];
        }
      } else if (typeof value === 'object' && value !== null) {
        traverse(value, [...path, key]);
      }
    }
  }

  traverse(uiData);
  return messages;
}

// Simple deep merge helper
function deepMerge(target: any, source: any) {
  if (!source) return target;
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

const uiMessages = transformUiToMessages(ui);
const dialogueMessages = transformUiToMessages({ dialogue: dialogue });

// Merge existing locale files with the new ui messages
const messages = {
  en: deepMerge(deepMerge(en, uiMessages.en), dialogueMessages.en),
  zh: deepMerge(deepMerge(zh, uiMessages.zh), dialogueMessages.zh),
  'zh-TW': deepMerge(deepMerge(zhTW, uiMessages['zh-TW']), dialogueMessages['zh-TW']),
  ja: deepMerge(deepMerge(ja, uiMessages.ja), dialogueMessages.ja),
  ko: deepMerge(deepMerge(ko, uiMessages.ko), dialogueMessages.ko)
};

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: 'zh',  // 默认语言
  fallbackLocale: 'en',
  messages
})

export default i18n
