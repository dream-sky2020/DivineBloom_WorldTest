/**
 * 技能类型标签 (主动/被动/功能)
 */
export default {
    'skillTypes.active': {
        id: 'skillTypes.active',
        name: { zh: '主动', en: 'Active', 'zh-TW': '主動', ja: 'アクティブ', ko: '액티브' },
        description: { zh: '需要消耗回合或资源主动释放的技能。', en: 'Skills that require a turn or resources to activate manually.' },
        color: '#f87171'
    },
    'skillTypes.passive': {
        id: 'skillTypes.passive',
        name: { zh: '被动', en: 'Passive', 'zh-TW': '被動', ja: 'パッシブ', ko: '패시브' },
        description: { zh: '无需主动发动，满足条件即自动生效的能力。', en: 'Abilities that are always active or trigger automatically.' },
        color: '#60a5fa'
    },
    'skillTypes.utility': {
        id: 'skillTypes.utility',
        name: { zh: '功能', en: 'Utility', 'zh-TW': '功能', ja: 'ユーティリティ', ko: '유틸리티' },
        description: { zh: '非战斗直接伤害，用于辅助或特殊机制的技能。', en: 'Skills used for support or special mechanics instead of direct damage.' },
        color: '#34d399'
    }
}
