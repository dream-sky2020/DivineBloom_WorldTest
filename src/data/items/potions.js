export default {
    // --- HP Recovery ---
    item_consumable_potion: {
        id: "item_consumable_potion",
        name: {
            zh: '回复药水',
            'zh-TW': '回復藥水',
            en: 'Potion',
            ja: 'ポーション',
            ko: '포션'
        },
        type: "itemTypes.consumable",
        targetType: "ally",
        effects: [
            { type: "heal", value: 50, percent: 0.01 }
        ],
        icon: "icon_potion",
        subText: {
            zh: 'HP +50 (+1%)',
            'zh-TW': 'HP +50 (+1%)',
            en: 'HP +50 (+1%)',
            ja: 'HP +50 (+1%)',
            ko: 'HP +50 (+1%)'
        },
        footerLeft: "itemTypes.consumable",
        description: {
            zh: '恢复少量生命值及1%最大生命值的药水。',
            'zh-TW': '恢復少量生命值及1%最大生命值的藥水。',
            en: 'Restores 50 HP and 1% of Max HP.',
            ja: 'HPを50と最大HPの1%回復する薬。',
            ko: 'HP 50과 최대 HP의 1%를 회복하는 물약.'
        }
    },
    item_consumable_hi_potion: {
        id: "item_consumable_hi_potion",
        name: {
            zh: '高级回复药水',
            'zh-TW': '高級回復藥水',
            en: 'Hi-Potion',
            ja: 'ハイポーション',
            ko: '하이 포션'
        },
        type: "itemTypes.consumable",
        targetType: "ally",
        effects: [
            { type: "heal", value: 200, percent: 0.05 }
        ],
        icon: "icon_potion",
        subText: {
            zh: 'HP +200 (+5%)',
            'zh-TW': 'HP +200 (+5%)',
            en: 'HP +200 (+5%)',
            ja: 'HP +200 (+5%)',
            ko: 'HP +200 (+5%)'
        },
        footerLeft: "itemTypes.consumable",
        description: {
            zh: '恢复中量生命值及5%最大生命值的药水。',
            'zh-TW': '恢復中量生命值及5%最大生命值的藥水。',
            en: 'Restores 200 HP and 5% of Max HP.',
            ja: 'HPを200と最大HPの5%回復する薬。',
            ko: 'HP 200과 최대 HP의 5%를 회복하는 물약.'
        }
    },
    item_consumable_splash_potion: {
        id: "item_consumable_splash_potion",
        name: {
            zh: '大范围喷溅治疗药水',
            'zh-TW': '大範圍噴濺治療藥水',
            en: 'Splashing Healing Potion',
            ja: 'スプラッシュポーション',
            ko: '스플래시 포션'
        },
        type: "itemTypes.consumable",
        targetType: "allAllies",
        effects: [
            { type: "heal_all", value: 300, percent: 0.03 }
        ],
        icon: "icon_potion_splash",
        subText: {
            zh: '群体 HP +300 (+3%)',
            'zh-TW': '群體 HP +300 (+3%)',
            en: 'Group HP +300 (+3%)',
            ja: '全体 HP +300 (+3%)',
            ko: '전체 HP +300 (+3%)'
        },
        footerLeft: "itemTypes.consumable",
        description: {
            zh: '恢复所有队友300点生命值及3%最大生命值。',
            'zh-TW': '恢復所有隊友300點生命值及3%最大生命值。',
            en: 'Restores 300 HP and 3% Max HP to all allies.',
            ja: '味方全員のHPを300と最大HPの3%回復する。',
            ko: '아군 전원의 HP를 300과 최대 HP의 3%만큼 회복시킨다.'
        }
    },

    // --- MP Recovery ---
    item_consumable_ether: {
        id: "item_consumable_ether",
        name: {
            zh: '魔法药水',
            'zh-TW': '魔法藥水',
            en: 'Ether',
            ja: 'エーテル',
            ko: '에테르'
        },
        type: "itemTypes.consumable",
        targetType: "ally",
        effects: [
            { type: "recoverMp", value: 50, percent: 0.02 }
        ],
        icon: "icon_potion",
        subText: {
            zh: 'MP +50 (+2%)',
            'zh-TW': 'MP +50 (+2%)',
            en: 'MP +50 (+2%)',
            ja: 'MP +50 (+2%)',
            ko: 'MP +50 (+2%)'
        },
        footerLeft: "itemTypes.consumable",
        description: {
            zh: '恢复少量魔法值及2%最大魔法值的药水。',
            'zh-TW': '恢復少量魔法值及2%最大魔法值的藥水。',
            en: 'Restores 50 MP and 2% of Max MP.',
            ja: 'MPを50と最大MPの2%回復する薬。',
            ko: 'MP 50과 최대 MP의 2%를 회복하는 물약.'
        }
    },
}
