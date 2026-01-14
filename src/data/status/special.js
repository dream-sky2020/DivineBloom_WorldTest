export default {
    'status_ammo_count': {
        id: 'status_ammo_count',
        name: {
            zh: '残弹余数',
            'zh-TW': '殘彈餘數',
            en: 'Ammo Count',
            ja: '残弾',
            ko: '잔탄 수 (殘彈餘數)'
        },
        type: "statusTypes.special", // 改为特殊类型以支持特殊UI条
        icon: "icon_ammo",
        subText: {
            zh: '剩余弹药',
            'zh-TW': '剩餘彈藥',
            en: 'Ammo Left',
            ja: '残弾数',
            ko: '남은 탄약'
        },
        description: {
            zh: '当前剩余的弹药数量。消耗完后需要重新装填。',
            'zh-TW': '當前剩餘的彈藥數量。消耗完後需要重新裝填。',
            en: 'Current remaining ammunition. Requires reloading when depleted.',
            ja: '現在の残弾数。使い切るとリロードが必要。',
            ko: '현재 남은 탄약 수. 다 쓰면 재장전이 필요하다.'
        },
        decayMode: 'none', // 不自动减少
        hasStack: true, // 启用层数/强度显示
        stackLabel: { // 可选：用于UI显示层数含义
            zh: '发',
            'zh-TW': '發',
            en: 'rds',
            ja: '発',
            ko: '발'
        },
        effects: []
    },
    'status_chambered_count': {
        id: 'status_chambered_count',
        name: {
            zh: '弦上余数',
            'zh-TW': '弦上餘數',
            en: 'Chambered Count',
            ja: '弦上餘數',
            ko: '장전 수 (弦上餘數)'
        },
        type: "statusTypes.special",
        icon: "icon_sniper", // 暂用瞄准图标
        subText: {
            zh: '子弹上膛',
            'zh-TW': '子彈上膛',
            en: 'Ammo Ready',
            ja: '弾薬装填',
            ko: '탄약 장전'
        },
        description: {
            zh: '子弹已装填',
            'zh-TW': '子彈已裝填',
            en: 'Special ammo is chambered.',
            ja: '弾が装填されており',
            ko: '탄약이 장전되어 있음'
        },
        decayMode: 'none', // 不自动减少
        hasStack: true,
        stackLabel: {
            zh: '发',
            'zh-TW': '發',
            en: 'rds',
            ja: '発',
            ko: '발'
        },
        effects: []
    },
}
