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
                variant: "will_to_live",
                trigger: "onHpZero",
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
            zh: '当生命值归零时，不会立刻死亡而是进入濒死状态。在濒死状态下再次受到伤害有概率死亡。回复生命值可解除濒死。',
            'zh-TW': '當生命值歸零時，不會立刻死亡而是進入瀕死狀態。在瀕死狀態下再次受到傷害有概率死亡。回復生命值可解除瀕死。',
            en: 'When HP reaches zero, enter Dying state instead of dying. Taking damage while Dying has a chance to cause death. Healing removes Dying.',
            ja: 'HP가 0になった時、即座に死亡せず瀕死状態になる。瀕死状態でダメージを受けると確率で死亡する。回復すると解除される。',
            ko: '생명력이 0이 되어도 즉시 사망하지 않고 빈사 상태가 됩니다. 빈사 상태에서 피해를 입으면 확률적으로 사망합니다. 회복 시 해제됩니다.'
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
                variant: "call_of_death",
                trigger: "onHpZero"
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
            zh: '生命值归零时立刻死亡。任何生灵终有一死。',
            'zh-TW': '生命值歸零時立刻死亡。任何生靈終有一死。',
            en: 'Dies immediately when HP reaches zero. All living things must eventually die.',
            ja: 'HP가 0になると即座に死亡する。すべての生けるものは死を免れない。',
            ko: '생명력이 0이 되면 즉시 사망합니다. 모든 생명체는 결국 죽음을 맞이합니다.'
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
                variant: "add_status",
                trigger: "onHpZero",
                status: "status_paralyzed",
                duration: 2,
                priority: 90
            }
        ],
        description: {
            zh: '血量归零时立即回满血量并陷入2回合麻痹状态。每场战斗触发1次。',
            en: 'Fully restore HP when it reaches zero, but become Paralyzed for 2 turns. Once per battle.'
        }
    }
}
