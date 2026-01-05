export default {
    // Physical Skills
    101: {
        id: 101,
        name: {
            zh: '强力斩击',
            'zh-TW': '強力斬擊',
            en: 'Power Slash',
            ja: 'パワースラッシュ',
            ko: '파워 슬래시'
        },
        type: "skillTypes.active",
        category: "skillCategories.physical",
        targetType: "enemy",
        effects: [
            { type: "damage", value: 1.5, scaling: "atk" },
            { type: "applyStatus", status: 5, chance: 0.3, duration: 3 }
        ],
        icon: "icon_sword",
        cost: "5 MP",
        subText: {
            zh: '单体物理伤害/流血',
            'zh-TW': '單體物理傷害/流血',
            en: 'Phys Dmg/Bleed',
            ja: '単体物理/出血',
            ko: '단일 물리/출혈'
        },
        description: {
            zh: '对一名敌人造成强力的物理伤害，有几率造成流血。',
            'zh-TW': '對一名敵人造成強力的物理傷害，有機率造成流血。',
            en: 'Deals powerful physical damage, chance to bleed.',
            ja: '敵単体に強力な物理ダメージを与え、出血させることがある。',
            ko: '적 한 명에게 강력한 물리 피해를 주고 출혈을 일으킬 수 있다.'
        }
    },
    102: {
        id: 102,
        name: {
            zh: '回旋斩',
            'zh-TW': '迴旋斬',
            en: 'Spinning Slash',
            ja: '回転斬り',
            ko: '회전 베기'
        },
        type: "skillTypes.active",
        category: "skillCategories.physical",
        targetType: "allEnemies",
        effects: [
            { type: "damage", value: 0.8, scaling: "atk" },
            { type: "applyStatus", status: 5, chance: 0.2, duration: 2 }
        ],
        icon: "icon_impact",
        cost: "15 MP",
        subText: {
            zh: '群体物理伤害/流血',
            'zh-TW': '群體物理傷害/流血',
            en: 'AoE Phys Dmg/Bleed',
            ja: '全体物理/出血',
            ko: '전체 물리/출혈'
        },
        description: {
            zh: '挥舞武器攻击所有敌人，有低几率造成流血。',
            'zh-TW': '揮舞武器攻擊所有敵人，有低機率造成流血。',
            en: 'Attacks all enemies, small chance to bleed.',
            ja: '武器を振り回して敵全体を攻撃する。低確率で出血させる。',
            ko: '무기를 휘둘러 적 전체를 공격한다. 낮은 확률로 출혈을 일으킨다.'
        }
    },
    103: {
        id: 103,
        name: {
            zh: '碧绿的尖刺爆炸',
            'zh-TW': '碧綠的尖刺爆炸',
            en: 'Emerald Spike Explosion',
            ja: 'エメラルドスパイク',
            ko: '에메랄드 스파이크'
        },
        type: "skillTypes.active",
        category: "skillCategories.physical",
        targetType: "allOtherUnits",
        effects: [
            { type: "damage", value: 1.2, scaling: "atk" },
            { type: "applyStatus", status: 1, chance: 0.4, duration: 3 }, // Poison
            { type: "applyStatus", status: 6, chance: 0.4, duration: 3 }, // Slow
            { type: "applyStatus", status: 5, chance: 0.4, duration: 3 }  // Bleed
        ],
        icon: "icon_spike_explosion",
        cost: "40 MP",
        subText: {
            zh: '全场伤害/异常状态',
            'zh-TW': '全場傷害/異常狀態',
            en: 'Field Dmg/Debuffs',
            ja: '全域ダメージ/状態異常',
            ko: '광역 피해/상태이상'
        },
        description: {
            zh: '对除自己以外的所有队友和敌人造成物理伤害，并有概率附加中毒、缓速和流血状态。',
            'zh-TW': '對除自己以外的所有隊友和敵人造成物理傷害，並有機率附加中毒、緩速和流血狀態。',
            en: 'Deals physical damage to all other allies and enemies, chance to poison, slow, and bleed.',
            ja: '自分以外の敵味方全員に物理ダメージを与え、確率で毒・スロウ・出血を付与する。',
            ko: '자신을 제외한 모든 아군과 적에게 물리 피해를 입히고, 확률적으로 중독, 감속, 출혈 상태를 부여한다.'
        }
    }
}

