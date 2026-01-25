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
        category: "cat_skill_passive",
        tags: ['mech_passive', 'mech_death_trigger'],
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
            ja: 'HPが0になった時、【瀕死】状态になる。この状態でダメージを受けると 30% の確率で死亡する。回復すると解除される。',
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
        category: "cat_skill_passive",
        tags: ['mech_passive', 'mech_death_trigger'],
        icon: "icon_skull",
        cost: "--",
        effects: [
            {
                type: "death_handler",
                variant: "instant_death",
                trigger: "onHpZero",
                preventDeath: false,
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
            zh: '生命值归零时直接死亡。没有任何特殊的生存手段。',
            'zh-TW': '生命值歸零時直接死亡。沒有任何特殊的生存手段。',
            en: 'Directly die when HP reaches zero. No special survival means.',
            ja: 'HPが0になった時、即座に死亡する。特殊な生存手段は一切ない。',
            ko: '생명력이 0이 되면 즉시 사망합니다. 어떤 특수한 생존 수단도 없습니다.'
        }
    },
    'skill_passive_hero_revive': {
        id: 'skill_passive_hero_revive',
        name: {
            zh: '英雄涅槃',
            'zh-TW': '英雄涅槃',
            en: 'Heroic Rebirth',
            ja: '英雄の涅槃',
            ko: '영웅의 열반'
        },
        exclusiveGroup: 'death_handler',
        exclusiveGroupPriority: 5,
        type: "skillTypes.passive",
        category: "cat_skill_passive",
        tags: ['mech_passive', 'mech_death_trigger', 'status_revive'],
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
            'zh-TW': '血量歸零時立即回滿血量並進入【涅槃瀕死】狀態（僅10%死亡率）。每場戰鬥觸發1次。',
            en: 'Fully restore HP when it reaches zero and enter Heroic Dying state (only 10% death rate). Once per battle.',
            ja: 'HPが0になった時、即座に全回復し【涅槃瀕死】状態になる（死亡率わずか10%）。1回の戦闘につき1回のみ発動。',
            ko: '생명력이 0이 되면 즉시 모든 생명력을 회복하고 【열반 빈사】 상태가 됩니다 (사망률 단 10%). 전투당 1회 발동.'
        }
    },
    'skill_passive_sprite_rebirth': {
        id: 'skill_passive_sprite_rebirth',
        name: {
            zh: '精灵重生',
            'zh-TW': '精靈重生',
            en: 'Sprite Rebirth',
            ja: '精霊の再生',
            ko: '정령의 재생'
        },
        exclusiveGroup: 'death_handler',
        exclusiveGroupPriority: 10,
        type: "skillTypes.passive",
        category: "cat_skill_passive",
        tags: ['mech_passive', 'mech_death_trigger', 'status_revive'],
        icon: "icon_revive",
        cost: "--",
        effects: [
            {
                type: "death_handler",
                variant: "apply_status",
                trigger: "onHpZero",
                status: "status_spirit_form",
                duration: 3,
                preventDeath: true,
                priority: 200
            }
        ],
        description: {
            zh: '生命值归零时不会死亡，而是进入3回合的【灵体化】状态。状态结束后将满血复活。',
            'zh-TW': '生命值歸零時不會死亡，而是進入3回合的【靈體化】狀態。狀態結束後將滿血復活。',
            en: 'Will not die when HP reaches zero, instead entering Spirit Form for 3 turns. Will revive with full HP after the state ends.',
            ja: 'HPが0になっても死亡せず、3ターンの間【霊体化】状態になる。状態終了後、HP全快で復活する。',
            ko: '생명력이 0이 되어도 사망하지 않고, 대신 3턴 동안 【영체화】 상태가 됩니다. 상태 종료 후 모든 생명력을 회복하며 부활합니다.'
        }
    },
    'skill_passive_mortal_coil': {
        id: 'skill_passive_mortal_coil',
        name: {
            zh: '凡人之躯',
            'zh-TW': '凡人之軀',
            en: 'Mortal Coil',
            ja: '凡人の体',
            ko: '범인의 몸'
        },
        exclusiveGroup: 'death_handler',
        exclusiveGroupPriority: 0,
        type: "skillTypes.passive",
        category: "cat_skill_passive",
        tags: ['mech_passive', 'mech_death_trigger'],
        icon: "icon_human",
        cost: "--",
        effects: [
            {
                type: "death_handler",
                variant: "apply_status",
                trigger: "onHpZero",
                status: "status_dying_fragile",
                preventDeath: true,
                priority: 0
            }
        ],
        subText: {
            zh: '基本生命',
            'zh-TW': '基本生命',
            en: 'Basic Life',
            ja: '基本生命',
            ko: '기본 생명'
        },
        description: {
            zh: '生命值归零时进入【天命已至】状态。在此状态下再次受击将必定死亡。',
            'zh-TW': '生命值歸零時進入【天命已至】狀態。在此狀態下再次受擊將必定死亡。',
            en: 'When HP reaches zero, enter Fate Sealed state. Taking any further damage results in immediate death.',
            ja: 'HPが0になった時、【天命尽きたり】状態になる。この状態で再度ダメージを受けると確実に死亡する。',
            ko: '생명력이 0이 되면 【천명에 이름】 상태가 됩니다. 이 상태에서 다시 피해를 입으면 반드시 사망합니다.'
        }
    }
}
