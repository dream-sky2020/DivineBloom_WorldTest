import i18n from '@/i18n';

/**
 * 从本地化对象中获取文本
 * @param {Object|string} obj 本地化对象 (e.g., { zh: '...', en: '...' }) 或 字符串
 * @returns {string} 本地化文本
 */
export function getLocalizedText(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    
    // 获取当前语言
    const locale = i18n.global.locale.value || i18n.global.locale;
    
    return obj[locale] || obj.zh || obj.en || Object.values(obj)[0] || '';
}
