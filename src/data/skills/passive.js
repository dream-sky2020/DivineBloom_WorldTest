export default {
    // Passive Skills
    'skill_passive_attack_up': {
        id: 'skill_passive_attack_up',
        name: {
            zh: '攻击强化',
            'zh-TW': '攻擊強化',
            en: 'Attack Up',
            ja: '攻撃力強化',
            ko: '공격력 강화'
        },
        type: "skillTypes.passive",
        category: "skillCategories.passive",
        icon: "icon_strength",
        cost: "--",
        effects: [
            {
                type: "stat_boost",
                stat: "atk",
                value: 0.15, // +15%
                trigger: "battle_start"
            }
        ],
        subText: {
            zh: '被动效果',
            'zh-TW': '被動效果',
            en: 'Passive Effect',
            ja: 'パッシブ効果',
            ko: '패시브 효과'
        },
        description: {
            zh: '永久提升角色的物理攻击力。',
            'zh-TW': '永久提升角色的物理攻擊力。',
            en: 'Permanently increases physical attack power.',
            ja: 'キャラクターの物理攻撃力を永続的に上昇させる。',
            ko: '캐릭터의 물리 공격력을 영구적으로 상승시킨다.'
        }
    },
    'skill_passive_mana_regen': {
        id: 'skill_passive_mana_regen',
        name: {
            zh: '法力再生',
            'zh-TW': '法力再生',
            en: 'Mana Regen',
            ja: '魔力再生',
            ko: '마나 재생'
        },
        type: "skillTypes.passive",
        category: "skillCategories.passive",
        icon: "icon_mana",
        cost: "--",
        effects: [
            {
                type: "recover_mp",
                value: 10,
                trigger: "turnStart"
            }
        ],
        subText: {
            zh: '被动效果',
            'zh-TW': '被動效果',
            en: 'Passive Effect',
            ja: 'パッシブ効果',
            ko: '패시브 효과'
        },
        description: {
            zh: '每回合自动恢复少量魔法值。',
            'zh-TW': '每回合自動恢復少量魔法值。',
            en: 'Automatically restores a small amount of MP each turn.',
            ja: '毎ターンMPを少量自動回復する。',
            ko: '매 턴마다 소량의 MP를 자동으로 회복한다.'
        }
    },
    'skill_passive_heroic_will_shattered_prison': {
        id: 'skill_passive_heroic_will_shattered_prison',
        name: {
            zh: '英雄意志·破碎监牢',
            'zh-TW': '英雄意志·破碎監牢',
            en: 'Heroic Will: Shattered Prison',
            ja: '英雄の意志・砕かれた牢獄',
            ko: '영웅의 의지: 부서진 감옥'
        },
        type: "skillTypes.passive",
        category: "skillCategories.passive",
        icon: "icon_limit_break", // 假设复用或新加图标
        cost: "--",
        effects: [
            {
                type: "applyStatus",
                status: "status_shattered_prison",
                trigger: "on_cc_skip"
            }
        ],
        subText: {
            zh: '控制抵抗',
            'zh-TW': '控制抵抗',
            en: 'CC Resist',
            ja: '行動阻害耐性',
            ko: '제어 저항'
        },
        description: {
            zh: '当因无法行动（如麻痹、冻结）跳过回合时，获得"破碎监牢"状态，下一回合行动必定不会被阻止。',
            'zh-TW': '當因無法行動（如麻痺、凍結）跳過回合時，獲得"破碎監牢"狀態，下一回合行動必定不會被阻止。',
            en: 'When a turn is skipped due to CC (Stun, Freeze), gain "Shattered Prison" status, ensuring action next turn.',
            ja: '行動不能（麻痺、凍結など）によりターンをスキップした時、「砕かれた牢獄」状态を得て、次のターンは确实に行動できる。',
            ko: '행동 불가(마비, 동결 등)로 인해 턴을 건너뛸 때, "부서진 감옥" 상태를 얻어 다음 턴에는 반드시 행동할 수 있다.'
        }
    }
}
