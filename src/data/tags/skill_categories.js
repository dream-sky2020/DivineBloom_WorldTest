/**
 * 技能大类与职业特征
 */
export default {
    'cat_skill_physical': {
        id: 'cat_skill_physical',
        name: { zh: '体术', en: 'Physical', 'zh-TW': '體術', ja: '体術', ko: '체술' },
        description: { zh: '依靠肉体力量发动的战斗技术。', en: 'Combat techniques activated using physical strength.', 'zh-TW': '依靠肉體力量發動的戰鬥技術。', ja: '肉体の力を使って発動する戦闘技術。', ko: '육체적 힘을 사용하여 발동하는 전투 기술.' },
        color: '#aaaaaa'
    },
    'cat_skill_magic': {
        id: 'cat_skill_magic',
        name: { zh: '魔法', en: 'Magic', 'zh-TW': '魔法', ja: '魔法', ko: '마법' },
        description: { zh: '消耗精神力量引导的超自然现象。', en: 'Supernatural phenomena guided by consuming mental power.', 'zh-TW': '消耗精神力量引導的超自然現象。', ja: '精神力を消費して導かれる超自然現象。', ko: '정신력을 소모하여 유도되는 초자연적 현상.' },
        color: '#aa88ff'
    },
    'cat_skill_sword': {
        id: 'cat_skill_sword',
        name: { zh: '剑技', en: 'Sword Art', 'zh-TW': '劍技', ja: '剣技', ko: '검술' },
        description: { zh: '专精于剑类武器的攻击技巧。', en: 'Attack techniques specialized in sword-type weapons.', 'zh-TW': '專精於劍類武器的攻擊技巧。', ja: '剣類武器に特化した攻撃技術。', ko: '검류 무기에 특화된 공격 기술.' },
        color: '#cccccc'
    },
    'cat_skill_firearm': {
        id: 'cat_skill_firearm',
        name: { zh: '枪械', en: 'Firearm', 'zh-TW': '槍械', ja: '銃器', ko: '총기' },
        description: { zh: '涉及各种火器或远程射击的技巧。', en: 'Techniques involving various firearms or ranged shooting.', 'zh-TW': '涉及各種火器或遠程射擊的技巧。', ja: '各種火器や遠距離射撃に関する技術。', ko: '각종 화기나 원거리 사격과 관련된 기술.' },
        color: '#888888'
    },
    'cat_skill_support': {
        id: 'cat_skill_support',
        name: { zh: '辅助', en: 'Support', 'zh-TW': '輔助', ja: '補助', ko: '보조' },
        description: { zh: '提供治疗、护盾 or 增益效果的技能。', en: 'Skills that provide healing, shields, or buffs.', 'zh-TW': '提供治療、護盾或增益效果的技能。', ja: '回復、シールド、またはバフ効果を提供するスキル。', ko: '치유, 보호막 또는 버프 효과를 제공하는 스킬.' },
        color: '#00ffcc'
    },
    'cat_skill_passive': {
        id: 'cat_skill_passive',
        name: { zh: '被动', en: 'Passive', 'zh-TW': '被動', ja: 'パッシブ', ko: '패시브' },
        description: { zh: '无需主动发动，持续生效的能力。', en: 'Abilities that are always active without manual activation.', 'zh-TW': '無需主動發動，持續生效的能力。', ja: '手動で発動する必要がなく、常に有効な能力。', ko: '별도의 발동 없이 지속적으로 적용되는 능력.' },
        color: '#ffffff'
    }
}
