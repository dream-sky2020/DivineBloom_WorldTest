// src/data/skills.js

/**
 * 技能数据库
 * ID 规则:
 * 100-199: 物理攻击技能 (Physical)
 * 200-299: 魔法攻击技能 (Magic)
 * 300-399: 治疗/辅助技能 (Support)
 * 400-499: 被动技能 (Passive)
 */
export const skillsDb = {
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
      { type: "damage", value: 1.5, scaling: "atk" }
    ],
    icon: "⚔️",
    cost: "5 MP",
    subText: {
      zh: '单体物理伤害',
      'zh-TW': '單體物理傷害',
      en: 'Single Target Phys Dmg',
      ja: '単体物理ダメージ',
      ko: '단일 물리 피해'
    },
    description: {
      zh: '对一名敌人造成强力的物理伤害。',
      'zh-TW': '對一名敵人造成強力的物理傷害。',
      en: 'Deals powerful physical damage to one enemy.',
      ja: '敵単体に強力な物理ダメージを与える。',
      ko: '적 한 명에게 강력한 물리 피해를 준다.'
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
      { type: "damage", value: 0.8, scaling: "atk" }
    ],
    icon: "💥",
    cost: "15 MP",
    subText: {
      zh: '群体物理伤害',
      'zh-TW': '群體物理傷害',
      en: 'AoE Phys Dmg',
      ja: '全体物理ダメージ',
      ko: '전체 물리 피해'
    },
    description: {
      zh: '挥舞武器攻击所有敌人。',
      'zh-TW': '揮舞武器攻擊所有敵人。',
      en: 'Attacks all enemies by swinging the weapon around.',
      ja: '武器を振り回して敵全体を攻撃する。',
      ko: '무기를 휘둘러 적 전체를 공격한다.'
    }
  },

  // Magic Skills
  201: {
    id: 201,
    name: {
      zh: '火球术',
      'zh-TW': '火球術',
      en: 'Fireball',
      ja: 'ファイアボール',
      ko: '파이어볼'
    },
    type: "skillTypes.active",
    category: "skillCategories.magic",
    element: "elements.fire",
    targetType: "enemy",
    effects: [
      { type: "damage", value: 1.3, scaling: "mag", element: "elements.fire" }
    ],
    icon: "🔥",
    cost: "10 MP",
    subText: {
      zh: '单体火焰伤害',
      'zh-TW': '單體火焰傷害',
      en: 'Single Target Fire Dmg',
      ja: '単体火属性ダメージ',
      ko: '단일 화염 피해'
    },
    description: {
      zh: '发射火球攻击一名敌人，有几率造成烧伤。',
      'zh-TW': '發射火球攻擊一名敵人，有機率造成燒傷。',
      en: 'Launches a fireball at one enemy, chance to burn.',
      ja: '火の玉を放ち敵単体を攻撃する。火傷効果あり。',
      ko: '화염구를 발사하여 적 한 명을 공격한다. 화상 확률 있음.'
    }
  },
  202: {
    id: 202,
    name: {
      zh: '冰锥术',
      'zh-TW': '冰錐術',
      en: 'Ice Shard',
      ja: 'アイスシャード',
      ko: '아이스 샤드'
    },
    type: "skillTypes.active",
    category: "skillCategories.magic",
    element: "elements.ice",
    targetType: "enemy",
    effects: [
      { type: "damage", value: 1.2, scaling: "mag", element: "elements.ice" }
    ],
    icon: "❄️",
    cost: "12 MP",
    subText: {
      zh: '单体冰冻伤害',
      'zh-TW': '單體冰凍傷害',
      en: 'Single Target Ice Dmg',
      ja: '単体氷属性ダメージ',
      ko: '단일 얼음 피해'
    },
    description: {
      zh: '召唤锋利的冰锥攻击敌人，可能降低其速度。',
      'zh-TW': '召喚鋒利的冰錐攻擊敵人，可能降低其速度。',
      en: 'Summons sharp ice shards to attack, may lower speed.',
      ja: '鋭い氷の破片で攻撃する。速度低下の可能性あり。',
      ko: '날카로운 얼음 조각을 소환하여 공격한다. 속도 저하 가능성 있음.'
    }
  },
  203: {
    id: 203,
    name: {
      zh: '闪电链',
      'zh-TW': '閃電鏈',
      en: 'Chain Lightning',
      ja: 'チェーンライトニング',
      ko: '체인 라이트닝'
    },
    type: "skillTypes.active",
    category: "skillCategories.magic",
    element: "elements.lightning",
    targetType: "allEnemies",
    effects: [
      { type: "damage", value: 1.1, scaling: "mag", element: "elements.lightning" }
    ],
    icon: "⚡",
    cost: "25 MP",
    subText: {
      zh: '弹射雷电伤害',
      'zh-TW': '彈射雷電傷害',
      en: 'Bouncing Lightning Dmg',
      ja: '連鎖雷属性ダメージ',
      ko: '연쇄 번개 피해'
    },
    description: {
      zh: '释放一道在敌人之间跳跃的闪电。',
      'zh-TW': '釋放一道在敵人之間跳躍的閃電。',
      en: 'Unleashes a bolt of lightning that jumps between enemies.',
      ja: '敵の間を跳ね回る稲妻を放つ。',
      ko: '적들 사이를 튕겨 다니는 번개를 방출한다.'
    }
  },

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
    icon: "💚",
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
    icon: "🛡️",
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
      ko: '짧은 시간 동안 아군 전체의 방어력을 높인다.'
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
    icon: "✨",
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

  // Passive Skills
  401: {
    id: 401,
    name: {
      zh: '攻击强化',
      'zh-TW': '攻擊強化',
      en: 'Attack Up',
      ja: '攻撃力強化',
      ko: '공격력 강화'
    },
    type: "skillTypes.passive",
    category: "skillCategories.passive",
    icon: "🦾",
    cost: "--",
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
  402: {
    id: 402,
    name: {
      zh: '法力再生',
      'zh-TW': '法力再生',
      en: 'Mana Regen',
      ja: '魔力再生',
      ko: '마나 재생'
    },
    type: "skillTypes.passive",
    category: "skillCategories.passive",
    icon: "💧",
    cost: "--",
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
  }
};
