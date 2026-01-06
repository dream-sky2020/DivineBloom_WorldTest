export default {
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
      { type: "damage", value: 1.3, scaling: "mag", element: "elements.fire", minOffset: -0.1, maxOffset: 0.1 }
    ],
    icon: "icon_fire",
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
      { type: "damage", value: 1.2, scaling: "mag", element: "elements.ice", minOffset: -0.1, maxOffset: 0.1 },
      { type: "applyStatus", status: 3, chance: 0.2, duration: 1 }, // Freeze
      { type: "applyStatus", status: 6, chance: 0.3, duration: 3 }  // Slow
    ],
    icon: "icon_ice",
    cost: "12 MP",
    subText: {
      zh: '单体冰冻伤害/冻结/减速',
      'zh-TW': '單體冰凍傷害/凍結/減速',
      en: 'Ice Dmg/Freeze/Slow',
      ja: '単体氷/凍結/スロウ',
      ko: '단일 얼음/동결/감속'
    },
    description: {
      zh: '召唤锋利的冰锥攻击敌人，有几率冻结敌人或降低其速度。',
      'zh-TW': '召喚鋒利的冰錐攻擊敵人，有機率凍結敵人或降低其速度。',
      en: 'Summons sharp ice shards, chance to freeze or lower speed.',
      ja: '鋭い氷の破片で攻撃する。凍結または速度低下の効果がある。',
      ko: '날카로운 얼음 조각을 소환하여 공격한다. 동결 또는 속도 감소 확률이 있다.'
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
    // Changed to enemy to allow selecting the start of the chain
    targetType: "enemy",
    chain: 3, // Bounce 3 times
    decay: 0.85, // 85% damage per bounce
    effects: [
      { type: "damage", value: 1.1, scaling: "mag", element: "elements.lightning", minOffset: -0.1, maxOffset: 0.1 },
      { type: "applyStatus", status: 4, chance: 0.3, duration: 2 }
    ],
    icon: "icon_lightning",
    cost: "25 MP",
    subText: {
      zh: '弹射雷电/麻痹',
      'zh-TW': '彈射雷電/麻痺',
      en: 'Bounce Lightning/Paralysis',
      ja: '連鎖雷属性ダメージ',
      ko: '연쇄 번개 피해'
    },
    description: {
      zh: '释放一道在敌人之间跳跃的闪电，有几率造成麻痹。',
      'zh-TW': '釋放一道在敵人之間跳躍的閃電，有機率造成麻痺。',
      en: 'Unleashes a bolt of lightning that jumps between enemies, chance to paralyze.',
      ja: '敵の間を跳ね回る稲妻を放つ。',
      ko: '적들 사이를 튕겨 다니는 번개를 방출한다.'
    }
  },
  204: {
    id: 204,
    name: {
      zh: '平等的疫碧雨',
      'zh-TW': '平等的疫碧雨',
      en: 'Equal Plague Rain',
      ja: '平等の疫病雨',
      ko: '평등한 역병 비'
    },
    type: "skillTypes.active",
    category: "skillCategories.magic",
    element: "elements.water",
    targetType: "allUnits",
    effects: [
      { type: "plague_rain", value: 200, minOffset: -0.1, maxOffset: 0.1 }, // Heal effect
      { type: "applyStatus", status: 1, duration: 3, chance: 0.5 },   // Poison
      { type: "applyStatus", status: 101, duration: 3, chance: 0.5 }  // Regen
    ],
    icon: "icon_plague_rain",
    cost: "50 MP",
    subText: {
      zh: '敌我全体中毒/再生/治疗',
      'zh-TW': '敵我全體中毒/再生/治療',
      en: 'Global Poison/Regen/Heal',
      ja: '敵味方全体毒/再生/回復',
      ko: '피아 전체 중독/재생/치유'
    },
    description: {
      zh: '降下带有疫病与恩赐的大雨，使场上所有单位中毒并获得再生，同时恢复生命值。',
      'zh-TW': '降下帶有疫病與恩賜的大雨，使場上所有單位中毒並獲得再生，同時恢復生命值。',
      en: 'Rains down plague and grace, poisoning and granting regen to all units, while restoring HP.',
      ja: '疫病と恩恵をもたらす雨を降らせ、全ユニットを毒と再生状態にし、HPを回復する。',
      ko: '역병과 은총을 담은 비를 내려 모든 유닛을 중독 및 재생 상태로 만들고 HP를 회복시킨다.'
    }
  },

  205: {
    id: 205,
    name: {
      zh: '将神之敌困于人间地狱',
      'zh-TW': '將神之敵困於人間地獄',
      en: 'Trapping God\'s Enemy in Living Hell',
      ja: '神の敵を生き地獄に',
      ko: '신의 적을 생지옥에 가두다'
    },
    type: "skillTypes.active",
    category: "skillCategories.magic",
    element: "elements.dark",
    targetType: "deadEnemy",
    effects: [
      { type: "revive_enemy", value: 0.5 },
      { type: "applyStatus", status: 1, duration: 3, chance: 0.2 }, // Poison
      { type: "applyStatus", status: 2, duration: 3, chance: 0.2 }, // Burn
      { type: "applyStatus", status: 3, duration: 3, chance: 0.2 }, // Freeze
      { type: "applyStatus", status: 4, duration: 3, chance: 0.2 }, // Paralysis
      { type: "applyStatus", status: 5, duration: 3, chance: 0.2 }, // Bleed
      { type: "applyStatus", status: 7, duration: 3, chance: 0.2 }, // Def Down
      { type: "applyStatus", status: 8, duration: 3, chance: 0.2 }  // Atk Down
    ],
    icon: "icon_hell_revival",
    cost: "100 MP",
    subText: {
      zh: '复活敌方并施加诅咒',
      'zh-TW': '復活敵方並施加詛咒',
      en: 'Revive Enemy w/ Curse',
      ja: '敵蘇生/呪い',
      ko: '적 부활/저주'
    },
    description: {
      zh: '复活一名敌方单位，并使其陷入包含中毒、燃烧、麻痹、冰封、流血及攻防降低在内的地狱状态，持续20回合。',
      'zh-TW': '復活一名敵方單位，並使其陷入包含中毒、燃燒、麻痺、冰封、流血及攻防降低在內的地獄狀態，持續20回合。',
      en: 'Revives an enemy and inflicts them with hellish statuses including poison, burn, paralysis, freeze, bleed, and lowered stats for 20 turns.',
      ja: '敵1体を蘇生し、毒、火傷、麻痺、凍結、出血、ステータス低下を含む地獄の状態異常を20ターン付与する。',
      ko: '적 한 명을 부활시키고 중독, 화상, 마비, 동결, 출혈 및 능력치 감소를 포함한 지옥의 상태이상을 20턴 동안 부여한다.'
    }
  }
}
