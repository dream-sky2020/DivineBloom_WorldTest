export default {
    // --- 射击技能 (Firearm Skills) ---

    // 基础射击
    'skill_firearm_shoot': {
        id: 'skill_firearm_shoot',
        name: {
            zh: '射击',
            'zh-TW': '射擊',
            en: 'Shoot',
            ja: '射撃',
            ko: '사격'
        },
        type: "skillTypes.active",
        category: "skillCategories.physical",
        icon: "icon_skill_shoot",
        subText: {
            zh: '单体物理伤害',
            'zh-TW': '單體物理傷害',
            en: 'Single Target Physical Dmg',
            ja: '単体物理ダメージ',
            ko: '단일 물리 피해'
        },
        description: {
            zh: '使用枪械对敌人进行射击。',
            'zh-TW': '使用槍械對敵人進行射擊。',
            en: 'Shoot the enemy with a firearm.',
            ja: '銃器で敵を射撃する。',
            ko: '총기로 적을 사격한다.'
        },
        targetType: "enemy",
        cost: "1 Ammo", // UI 显示
        costs: [
            { type: 'status_duration', id: 'status_chambered_count', amount: 1 } // 逻辑消耗：弦上余数 (持续时间)
        ],
        effects: [
            { type: 'damage', scaling: 'atk', value: 1.0, maxOffset: 1.2 }
        ]
    },

    // 快速射击 (不消耗回合)
    'skill_firearm_quick_shot': {
        id: 'skill_firearm_quick_shot',
        name: {
            zh: '快速射击',
            'zh-TW': '快速射擊',
            en: 'Quick Shot',
            ja: 'クイックショット',
            ko: '속사'
        },
        type: "skillTypes.active",
        category: "skillCategories.physical",
        icon: "icon_skill_shoot_speed", // 假设有加速图标
        subText: {
            zh: '敏捷射击',
            'zh-TW': '敏捷射擊',
            en: 'Agile Shot',
            ja: '早撃ち',
            ko: '민첩한 사격'
        },
        description: {
            zh: '以敏捷的身手进行射击，不消耗回合。造成少量伤害。',
            'zh-TW': '以敏捷的身手進行射擊，不消耗回合。造成少量傷害。',
            en: 'Fires a quick shot that does not end turn. Deals minor damage.',
            ja: '素早く射撃を行う。ターンを消費しない。小ダメージを与える。',
            ko: '민첩하게 사격한다. 턴을 소모하지 않는다. 소량의 피해를 준다.'
        },
        targetType: "enemy",
        consumeTurn: false, // 不消耗回合
        cost: "1 Ammo",
        costs: [
            { type: 'status_duration', id: 'status_chambered_count', amount: 1 }
        ],
        effects: [
            { type: 'damage', scaling: 'atk', value: 0.8, maxOffset: 1.2 } // 伤害倍率略低
        ]
    }
};
