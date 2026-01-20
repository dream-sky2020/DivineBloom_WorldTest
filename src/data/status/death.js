export default {
    'status_dying': {
        id: 'status_dying',
        name: {
            zh: '濒死',
            'zh-TW': '瀕死',
            en: 'Dying',
            ja: '瀕死',
            ko: '빈사 (瀕死)'
        },
        type: "statusTypes.special",
        icon: "icon_warning",
        description: {
            zh: '生命值已归零。再次受击有 30% 概率导致彻底死亡。',
            'zh-TW': '生命值已歸零。再次受擊有 30% 概率導致徹底死亡。',
            en: 'HP reached zero. Further hits have 30% chance to cause permanent death.',
            ja: 'HPがゼロになった。さらなる攻撃で 30% の確率で死亡する。',
            ko: '생명력이 0이 되었습니다. 추가 공격을 받으면 30% 확률로 완전히 사망할 수 있습니다.'
        },
        decayMode: 'none',
        deathChance: 0.3,
        effects: [
            { trigger: 'checkAction', type: 'stun', chance: 1.0 }
        ]
    },
    'status_dying_fragile': {
        id: 'status_dying_fragile',
        name: {
            zh: '天命已至',
            'zh-TW': '天命已至',
            en: 'Fate Sealed',
            ja: '天命',
            ko: '천명 (天命)'
        },
        type: "statusTypes.special",
        icon: "icon_skull",
        description: {
            zh: '生命值已归零。再次受击将必定死亡。',
            'zh-TW': '生命值已歸零。再次受擊將必定死亡。',
            en: 'HP reached zero. Further hits will result in immediate death.',
            ja: 'HPがゼロになった。さらなる攻撃で確実に死亡する。',
            ko: '생명력이 0이 되었습니다. 추가 공격을 받으면 확실히 사망합니다.'
        },
        decayMode: 'none',
        deathChance: 1.0,
        effects: [
            { trigger: 'checkAction', type: 'stun', chance: 1.0 }
        ]
    },
    'status_dying_heroic': {
        id: 'status_dying_heroic',
        name: {
            zh: '涅槃濒死',
            'zh-TW': '涅槃瀕死',
            en: 'Heroic Dying',
            ja: '涅槃',
            ko: '열반 (涅槃)'
        },
        type: "statusTypes.special",
        icon: "icon_phoenix",
        description: {
            zh: '生命值已归零。再次受击仅有 10% 概率导致死亡。',
            'zh-TW': '生命值已歸零。再次受擊僅有 10% 概率導致死亡。',
            en: 'HP reached zero. Further hits have only 10% chance to cause death.',
            ja: 'HPがゼロになった。さらなる攻撃で死亡する確率はわずか 10% です。',
            ko: '생명력이 0이 되었습니다. 추가 공격을 받아도 사망할 확률은 10%뿐입니다.'
        },
        decayMode: 'none',
        deathChance: 0.1,
        effects: [
            { trigger: 'checkAction', type: 'stun', chance: 1.0 }
        ]
    },
    'status_dead': {
        id: 'status_dead',
        name: {
            zh: '死亡',
            'zh-TW': '死亡',
            en: 'Dead',
            ja: '戦闘不能',
            ko: '사망'
        },
        type: "statusTypes.special",
        icon: "icon_death",
        description: {
            zh: '已无法战斗。需要复活手段才能归队。',
            'zh-TW': '已無法戰鬥。需要復活手段才能歸隊。',
            en: 'Incapacitated and cannot continue fighting.',
            ja: '戦闘不能になった。復活手段が必要だ。',
            ko: '사망하여 전투를 계속할 수 없습니다. 부활 수단이 필요합니다.'
        },
        decayMode: 'none',
        persistent: true,
        effects: [
            { trigger: 'checkAction', type: 'stun', chance: 1.0 }
        ]
    },
}
