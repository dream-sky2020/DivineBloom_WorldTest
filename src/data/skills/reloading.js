export default {
    // 通用装填 (优先消耗状态储备，不足则消耗物品)
    'skill_firearm_reload': {
        id: 'skill_firearm_reload',
        name: {
            zh: '装填',
            'zh-TW': '裝填',
            en: 'Reload',
            ja: 'リロード',
            ko: '재장전'
        },
        type: "skillTypes.utility",
        category: "skillCategories.support", // 通用分类
        icon: "icon_skill_reload",
        subText: {
            zh: '装填弹药',
            'zh-TW': '裝填彈藥',
            en: 'Reload Ammo',
            ja: '弾薬リロード',
            ko: '탄약 재장전'
        },
        description: {
            zh: '装填武器。优先消耗储备弹药(Buff)，不足时消耗背包中的子弹。',
            'zh-TW': '裝填武器。優先消耗儲備彈藥(Buff)，不足時消耗背包中的子彈。',
            en: 'Reloads weapon. Prioritizes reserve ammo (Buff), uses inventory ammo if unavailable.',
            ja: '武器をリロードする。予備弾薬(バフ)を優先消費し、なければインベントリの弾薬を使用する。',
            ko: '무기를 재장전한다. 예비 탄약(버프)을 우선 소모하고, 부족하면 인벤토리의 탄약을 사용한다.'
        },
        targetType: "self",
        cost: "5 Rounds", // 显示文本，可能需要动态化，但此处为静态描述
        costs: [
            // 优先级 0: 消耗储备弹药状态
            { type: 'status_duration', id: 'status_ammo_count', amount: 5, group: 0 },
            // 优先级 1: 消耗背包物品 (item_ammo_standard)
            { type: 'item', id: 'item_ammo_standard', amount: 5, group: 1 }
        ],
        effects: [
            { type: 'applyStatus', status: 'status_chambered_count', duration: 5, target: 'self' }
        ]
    },

    // 快速装填 (不消耗回合)
    'skill_firearm_quick_reload': {
        id: 'skill_firearm_quick_reload',
        name: {
            zh: '快速装填',
            'zh-TW': '快速裝填',
            en: 'Quick Reload',
            ja: 'クイックリロード',
            ko: '빠른 재장전'
        },
        type: "skillTypes.utility",
        category: "skillCategories.support",
        icon: "icon_skill_reload_speed", // 假设有加速图标
        subText: {
            zh: '迅速装填',
            'zh-TW': '迅速裝填',
            en: 'Fast Reload',
            ja: '迅速リロード',
            ko: '신속 재장전'
        },
        description: {
            zh: '以极快的速度装填武器，不消耗回合。',
            'zh-TW': '以極快的速度裝填武器，不消耗回合。',
            en: 'Reloads weapon instantly, does not end turn.',
            ja: '素早く武器をリロードする。ターンを消費しない。',
            ko: '매우 빠르게 무기를 재장전한다. 턴을 소모하지 않는다.'
        },
        targetType: "self",
        consumeTurn: false, // 不消耗回合
        cost: "5 Rounds",
        costs: [
            // 优先级 0: 消耗储备弹药状态
            { type: 'status_duration', id: 'status_ammo_count', amount: 5, group: 0 },
            // 优先级 1: 消耗背包物品 (item_ammo_standard)
            { type: 'item', id: 'item_ammo_standard', amount: 5, group: 1 }
        ],
        effects: [
            { type: 'applyStatus', status: 'status_chambered_count', duration: 5, target: 'self' }
        ]
    }
};
