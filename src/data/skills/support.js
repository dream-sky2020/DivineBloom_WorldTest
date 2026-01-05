export default {
    // Support Skills
    301: {
        id: 301,
        name: {
            zh: '治愈术',
            'zh-TW': '治癒術',
            en: 'Heal',
            ja: 'ヒール',
            ko: '힐'
        },
        type: "skillTypes.active",
        category: "skillCategories.support",
        targetType: "ally",
        effects: [
            { type: "heal", value: 500 }
        ],
        icon: "icon_heal",
        cost: "20 MP",
        subText: {
            zh: '单体治疗',
            'zh-TW': '單體治療',
            en: 'Single Target Heal',
            ja: '単体回復',
            ko: '단일 치유'
        },
        description: {
            zh: '恢复己方单体目标的生命值。',
            'zh-TW': '恢復己方單體目標的生命值。',
            en: 'Restores HP to a single ally.',
            ja: '味方単体のHPを回復する。',
            ko: '아군 한 명의 HP를 회복시킨다.'
        }
    },
    302: {
        id: 302,
        name: {
            zh: '护盾术',
            'zh-TW': '護盾術',
            en: 'Shield',
            ja: 'プロテス',
            ko: '쉴드'
        },
        type: "skillTypes.active",
        category: "skillCategories.support",
        targetType: "allAllies",
        effects: [
            { type: "buff", stat: "def", value: 1.5, duration: 3 }
        ],
        icon: "icon_shield",
        cost: "30 MP",
        subText: {
            zh: '增加防御',
            'zh-TW': '增加防禦',
            en: 'Increase Defense',
            ja: '防御力アップ',
            ko: '방어력 증가'
        },
        description: {
            zh: '在短时间内提高己方全体的防御力。',
            'zh-TW': '在短時間內提高己方全體的防禦力。',
            en: 'Temporarily increases defense for all allies.',
            ja: '短時間、味方全員の防御力を高める。',
            ko: '短い時間、味方全員の防御力を高める。'
        }
    },
    303: {
        id: 303,
        name: {
            zh: '复活术',
            'zh-TW': '復活術',
            en: 'Resurrection',
            ja: 'レイズ',
            ko: '부활'
        },
        type: "skillTypes.active",
        category: "skillCategories.support",
        targetType: "deadAlly",
        effects: [
            { type: "revive", value: 0.2 }
        ],
        icon: "icon_revive",
        cost: "40 MP",
        subText: {
            zh: '复活队友',
            'zh-TW': '復活隊友',
            en: 'Revive Ally',
            ja: '蘇生',
            ko: '아군 부활'
        },
        description: {
            zh: '复活一名倒下的队友并恢复少量生命值。',
            'zh-TW': '復活一名倒下的隊友並恢復少量生命值。',
            en: 'Revives a fallen ally with a small amount of HP.',
            ja: '倒れた仲間を蘇生し、HPを少量回復する。',
            ko: '쓰러진 아군을 부활시키고 소량의 HP를 회복시킨다.'
        }
    },

    304: {
        id: 304,
        name: {
            zh: '群体复活',
            'zh-TW': '群體復活',
            en: 'Mass Resurrection',
            ja: 'アレイズ',
            ko: '광역 부활'
        },
        type: "skillTypes.active",
        category: "skillCategories.support",
        targetType: "allDeadAllies",
        effects: [
            { type: "revive", value: 0.5 }
        ],
        icon: "icon_revive_all",
        cost: "80 MP",
        subText: {
            zh: '群体复活',
            'zh-TW': '群體復活',
            en: 'Mass Revive',
            ja: '全体蘇生',
            ko: '전체 부활'
        },
        description: {
            zh: '复活所有倒下的队友并恢复中量生命值。',
            'zh-TW': '復活所有倒下的隊友並恢復中量生命值。',
            en: 'Revives all fallen allies with a moderate amount of HP.',
            ja: '倒れた仲間全員を蘇生し、HPを中量回復する。',
            ko: '쓰러진 아군 전원을 부활시키고 중량의 HP를 회복시킨다.'
        }
    },
    305: {
        id: 305,
        name: {
            zh: '群体治疗术',
            'zh-TW': '群體治療術',
            en: 'Mass Heal',
            ja: 'ヒールオール',
            ko: '매스 힐'
        },
        type: "skillTypes.active",
        category: "skillCategories.support",
        targetType: "allAllies",
        effects: [
            { type: "heal_all", value: 500 }
        ],
        icon: "icon_heal_all",
        cost: "45 MP",
        subText: {
            zh: '群体治疗',
            'zh-TW': '群體治療',
            en: 'AoE Heal',
            ja: '全体回復',
            ko: '전체 치유'
        },
        description: {
            zh: '恢复己方全体成员的生命值。',
            'zh-TW': '恢復己方全體成員的生命值。',
            en: 'Restores HP to all allies.',
            ja: '味方全員のHPを回復する。',
            ko: '아군 전원의 HP를 회복시킨다.'
        }
    },
    306: {
        id: 306,
        name: {
            zh: '前进吧我的盟友',
            'zh-TW': '前進吧我的盟友',
            en: 'Forward, My Allies!',
            ja: '進め、我が盟友よ',
            ko: '전진하라, 나의 맹우여'
        },
        type: "skillTypes.active",
        category: "skillCategories.support",
        targetType: "allOtherAllies",
        effects: [
            { type: "buff", stat: "spd", value: 1.3, duration: 3 } // Haste
        ],
        icon: "icon_forward_allies",
        cost: "30 MP",
        subText: {
            zh: '盟友全体加速',
            'zh-TW': '盟友全體加速',
            en: 'Ally Speed Up',
            ja: '味方全体速度上昇',
            ko: '아군 전체 속도 증가'
        },
        description: {
            zh: '激励除自己以外的所有队友，提升他们的行动速度。',
            'zh-TW': '激勵除自己以外的所有隊友，提升他們的行動速度。',
            en: 'Inspires all allies except self, increasing their action speed.',
            ja: '自分以外の味方全員を鼓舞し、行動速度を上昇させる。',
            ko: '자신을 제외한 모든 아군을 격려하여 행동 속도를 증가시킨다.'
        }
    }
}

