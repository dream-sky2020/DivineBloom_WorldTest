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
            { type: "damage", value: 1.5, scaling: "atk", minOffset: -0.1, maxOffset: 0.1 },
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
            { type: "damage", value: 0.8, scaling: "atk", minOffset: -0.1, maxOffset: 0.1 },
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
            { type: "damage", value: 1.2, scaling: "atk", minOffset: -0.1, maxOffset: 0.1 },
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
    },
    104: {
        id: 104,
        name: {
            zh: '狂风骤雨',
            'zh-TW': '狂風驟雨',
            en: 'Flurry',
            ja: '疾風怒濤',
            ko: '질풍노도'
        },
        type: "skillTypes.active",
        category: "skillCategories.physical",
        targetType: "enemy",
        effects: [
            {
                type: "damage",
                value: 0.4,
                scaling: "atk",
                times: 5,
                minOffset: -0.1,
                maxOffset: 0.1
            }
        ],
        icon: "icon_sword",
        cost: "25 MP",
        subText: {
            zh: '5连击/物理',
            'zh-TW': '5連擊/物理',
            en: '5-Hit Phys',
            ja: '5回攻撃/物理',
            ko: '5연타/물리'
        },
        description: {
            zh: '如暴雨般对敌人发起5次连续攻击。',
            'zh-TW': '如暴雨般對敵人發起5次連續攻擊。',
            en: 'Unleashes 5 consecutive strikes like a storm.',
            ja: '嵐のような5連続攻撃を繰り出す。',
            ko: '폭풍우처럼 적에게 5회 연속 공격을 가한다.'
        }
    },
    105: {
        id: 105,
        name: {
            zh: '五月花乱斩',
            'zh-TW': '五月花亂斬',
            en: 'Mayflower Slash',
            ja: '五月雨斬り',
            ko: '오월우 베기'
        },
        type: "skillTypes.active",
        category: "skillCategories.physical",
        targetType: "enemy",
        effects: [
            {
                type: "damage",
                value: 0.35,
                scaling: "atk",
                minTimes: 5,
                maxTimes: 10,
                minOffset: -0.05,
                maxOffset: 0.05
            }
        ],
        icon: "icon_sword",
        cost: "35 MP",
        subText: {
            zh: '随机多段/物理',
            'zh-TW': '隨機多段/物理',
            en: 'Random Multi-Hit',
            ja: 'ランダム連続攻撃',
            ko: '랜덤 연속 공격'
        },
        description: {
            zh: '对敌人造成5到10次随机数量的物理伤害。',
            'zh-TW': '對敵人造成5到10次隨機數量的物理傷害。',
            en: 'Deals physical damage to an enemy 5 to 10 times randomly.',
            ja: '敵単体に5〜10回のランダムな回数の物理ダメージを与える。',
            ko: '적 하나에게 5~10회의 무작위 물리 피해를 입힌다.'
        }
    },
    106: {
        id: 106,
        name: {
            zh: '密集火网',
            'zh-TW': '密集火網',
            en: 'Concentrated Fire',
            ja: '集中砲火',
            ko: '집중 포화'
        },
        type: "skillTypes.active",
        category: "skillCategories.physical",
        targetType: "randomEnemy",
        randomHits: 4,
        effects: [
            {
                type: "damage",
                value: 0.6,
                scaling: "atk",
                minOffset: -0.05,
                maxOffset: 0.05
            }
        ],
        icon: "icon_impact", // 暂时使用 impact 图标
        cost: "45 MP",
        subText: {
            zh: '随机目标/4连击',
            'zh-TW': '隨機目標/4連擊',
            en: 'Random Target 4-Hit',
            ja: 'ランダム対象4連撃',
            ko: '랜덤 타겟 4연타'
        },
        description: {
            zh: '向敌阵倾泻火力，随机选择敌人攻击4次。',
            'zh-TW': '向敵陣傾瀉火力，隨機選擇敵人攻擊4次。',
            en: 'Unleashes firepower, attacking random enemies 4 times.',
            ja: '敵陣に火力を浴びせ、ランダムな敵を4回攻撃する。',
            ko: '적진에 화력을 쏟아부어, 무작위 적을 4회 공격한다.'
        }
    }
}
