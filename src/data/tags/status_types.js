/**
 * 状态/效果类型标签
 */
export default {
    'statusTypes.buff': {
        id: 'statusTypes.buff',
        name: { zh: '增益', en: 'Buff', 'zh-TW': '增益', ja: 'バフ', ko: '버프' },
        description: { zh: '对单位产生正面影响的状态。', en: 'Status effects that have a positive impact on the unit.' },
        color: '#4ade80'
    },
    'statusTypes.debuff': {
        id: 'statusTypes.debuff',
        name: { zh: '减益', en: 'Debuff', 'zh-TW': '減益', ja: 'デバフ', ko: '디버프' },
        description: { zh: '对单位产生负面影响的状态。', en: 'Status effects that have a negative impact on the unit.' },
        color: '#f87171'
    },
    'statusTypes.special': {
        id: 'statusTypes.special',
        name: { zh: '特殊', en: 'Special', 'zh-TW': '特殊', ja: '特殊', ko: '특수' },
        description: { zh: '不属于常规增减益，用于核心机制或流程控制的状态。', en: 'Status effects used for core mechanics or flow control.' },
        color: '#a855f7'
    }
}
