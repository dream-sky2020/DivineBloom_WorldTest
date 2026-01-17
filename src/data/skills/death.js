export default {
    'skill_passive_will_to_live': {
        id: 'skill_passive_will_to_live',
        name: {
            zh: '求生意志',
            'zh-TW': '求生意志',
            en: 'Will to Live',
            ja: '生存本能',
            ko: '생존 의지'
        },
        exclusiveGroup: 'death_handler',
        exclusiveGroupPriority: 2,
        type: "skillTypes.passive",
        category: "skillCategories.passive",
        icon: "icon_heart_pulse",
        cost: "--",
        effects: [
            {
                type: "death_handler",
                variant: "apply_status",
                trigger: "onHpZero",
                status: "status_dying",
                preventDeath: true,
                priority: 10
            }
        ],
        subText: {
            zh: '生存被动',
            'zh-TW': '生存被動',
            en: 'Survival Passive',
            ja: '生存パッシブ',
            ko: '생존 패시브'
        },
        description: {
            zh: '当生命值归零时，进入【濒死】状态。在此状态下受击有 30% 概率死亡。回复生命值可解除。',
            'zh-TW': '當生命值歸零時，進入【瀕死】狀態。在此狀態下受擊有 30% 概率死亡。回復生命值可解除。',
            en: 'When HP reaches zero, enter Dying state. Taking damage while Dying has a 30% chance to cause death. Healing removes it.',
            ja: 'HPが0になった時、【瀕死】状態になる。この状態でダメージを受けると 30% の確率で死亡する。回復すると解除される。',
            ko: '생명력이 0이 되면 【빈사】 상태가 됩니다. 이 상태에서 피해를 입으면 30% 확률로 사망합니다. 회복 시 해제됩니다.'
        }
    },
    'skill_passive_call_of_death': {
        id: 'skill_passive_call_of_death',
        name: {
            zh: '死亡呼唤',
            'zh-TW': '死亡呼喚',
            en: 'Call of Death',
            ja: '死の呼び声',
            ko: '죽음의 부름'
        },
        exclusiveGroup: 'death_handler',
        exclusiveGroupPriority: 1,
        type: "skillTypes.passive",
        category: "skillCategories.passive",
        icon: "icon_skull",
        cost: "--",
        effects: [
            {
                type: "death_handler",
                variant: "apply_status",
                trigger: "onHpZero",
                status: "status_dying_fragile",
                preventDeath: true,
                priority: 1
            }
        ],
        subText: {
            zh: '死亡宿命',
            'zh-TW': '死亡宿命',
            en: 'Memento Mori',
            ja: 'メメント・モリ',
            ko: '죽음의 숙명'
        },
        description: {
            zh: '生命值归零时进入【天命已至】状态。在此状态下再次受击将必定死亡。',
            'zh-TW': '生命值歸零時進入【天命已至】狀態。在此狀態下再次受擊將必定死亡。',
            en: 'When HP reaches zero, enter Fate Sealed state. Taking any further damage results in immediate death.',
            ja: 'HP가 0になると【天命】状態になる。この状態でダメージを受けると確実に死亡する。',
            ko: '생명력이 0이 되면 【천명】 상태가 됩니다. 이 상태에서 피해를 입으면 확실히 사망합니다.'
        }
    },
    'skill_passive_hero_revive': {
        id: 'skill_passive_hero_revive',
        name: { zh: '英雄涅槃', en: 'Heroic Rebirth' },
        exclusiveGroup: 'death_handler',
        exclusiveGroupPriority: 5,
        type: "skillTypes.passive",
        category: "skillCategories.passive",
        icon: "icon_phoenix",
        cost: "--",
        effects: [
            {
                type: "death_handler",
                variant: "revive",
                trigger: "onHpZero",
                preventDeath: true,
                healPercent: 1.0,
                limit: 1,
                priority: 100
            },
            {
                type: "death_handler",
                variant: "apply_status",
                trigger: "onHpZero",
                status: "status_dying_heroic",
                preventDeath: true,
                priority: 90
            }
        ],
        description: {
            zh: '血量归零时立即回满血量并进入【涅槃濒死】状态（仅10%死亡率）。每场战斗触发1次。',
            en: 'Fully restore HP when it reaches zero and enter Heroic Dying state (only 10% death rate). Once per battle.'
        }
    }
}
