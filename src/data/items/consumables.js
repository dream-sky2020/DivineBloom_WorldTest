export default {
  // --- Status Cure (1201-1300) ---
  item_consumable_antidote: {
    id: "item_consumable_antidote",
    name: {
      zh: '解毒草',
      'zh-TW': '解毒草',
      en: 'Antidote',
      ja: '毒消し草',
      ko: '해독초'
    },
    type: "itemTypes.consumable",
    targetType: "ally",
    effects: [
      { type: "cureStatus", status: "poison" }
    ],
    icon: "icon_herb",
    subText: {
      zh: '治疗中毒',
      'zh-TW': '治療中毒',
      en: 'Cures Poison',
      ja: '毒を治す',
      ko: '독 치료'
    },
    footerLeft: "itemTypes.consumable",
    description: {
      zh: '用于解除中毒状态的草药。',
      'zh-TW': '用於解除中毒狀態的草藥。',
      en: 'An herb used to cure poison.',
      ja: '毒状態を解除する草。',
      ko: '중독 상태를 해제하는 약초.'
    }
  },
  item_consumable_splash_holy_water: {
    id: "item_consumable_splash_holy_water",
    name: {
      zh: '大范围喷溅净化圣水',
      'zh-TW': '大範圍噴濺淨化聖水',
      en: 'Splashing Purifying Holy Water',
      ja: 'スプラッシュ聖水',
      ko: '스플래시 성수'
    },
    type: "itemTypes.consumable",
    targetType: "allAllies",
    effects: [
      { type: "cureStatus", status: "all" }
    ],
    icon: "icon_potion_splash",
    subText: {
      zh: '全员净化',
      'zh-TW': '全員淨化',
      en: 'Mass Purify',
      ja: '全体浄化',
      ko: '전체 정화'
    },
    footerLeft: "itemTypes.consumable",
    description: {
      zh: '解除所有队友的异常状态。',
      'zh-TW': '解除所有隊友的異常狀態。',
      en: 'Cures all status ailments for all allies.',
      ja: '味方全員の状態異常を回復する。',
      ko: '아군 전원의 상태 이상을 회복시킨다.'
    }
  },

  // --- Revive (1301-1400) ---
  item_consumable_phoenix_down: {
    id: "item_consumable_phoenix_down",
    name: {
      zh: '凤凰之羽',
      'zh-TW': '鳳凰之羽',
      en: 'Phoenix Down',
      ja: 'フェニックスの尾',
      ko: '피닉스의 깃털'
    },
    type: "itemTypes.consumable",
    targetType: "deadAlly",
    effects: [
      { type: "revive", value: 0.2 }
    ],
    icon: "icon_feather",
    subText: {
      zh: '复活',
      'zh-TW': '復活',
      en: 'Revive',
      ja: '蘇生',
      ko: '부활'
    },
    footerLeft: "itemTypes.consumable",
    description: {
      zh: '复活一名无法战斗的队友。',
      'zh-TW': '復活一名無法戰鬥的隊友。',
      en: 'Revives a KO\'d ally.',
      ja: '戦闘不能の仲間を蘇生する。',
      ko: '전투 불능이 된 동료를 부활시킨다.'
    }
  },
  item_consumable_phoenix_down_all: {
    id: "item_consumable_phoenix_down_all",
    name: {
      zh: '凤凰之尾·群',
      'zh-TW': '鳳凰之尾·群',
      en: 'Phoenix Down All',
      ja: 'フェニックスの尾・全',
      ko: '피닉스의 깃털·전'
    },
    type: "itemTypes.consumable",
    targetType: "allDeadAllies",
    effects: [
      { type: "revive", value: 0.5 }
    ],
    icon: "icon_feather_all",
    subText: {
      zh: '群体复活',
      'zh-TW': '群體復活',
      en: 'Mass Revive',
      ja: '全体蘇生',
      ko: '전체 부활'
    },
    footerLeft: "itemTypes.consumable",
    description: {
      zh: '复活所有无法战斗的队友。',
      'zh-TW': '復活所有無法戰鬥的隊友。',
      en: 'Revives all KO\'d allies.',
      ja: '戦闘不能の仲間全員を蘇生する。',
      ko: '전투 불능이 된 동료 전원을 부활시킨다.'
    }
  },

  // --- Offensive Items (1401-1500) ---
  item_consumable_fire_bomb: {
    id: "item_consumable_fire_bomb",
    name: {
      zh: '火焰炸弹',
      'zh-TW': '火焰炸彈',
      en: 'Fire Bomb',
      ja: 'ファイアボム',
      ko: '화염 폭탄'
    },
    type: "itemTypes.consumable",
    targetType: "enemy",
    effects: [
      { type: "damage", element: "fire", value: 300 },
      { type: "applyStatus", status: "status_burn", duration: 3, chance: 1.0 }
    ],
    icon: "icon_bomb",
    subText: {
      zh: '火焰伤害+烧伤',
      'zh-TW': '火焰傷害+燒傷',
      en: 'Fire Dmg + Burn',
      ja: '炎ダメージ+火傷',
      ko: '화염 피해+화상'
    },
    footerLeft: "itemTypes.consumable",
    description: {
      zh: '对一名敌人造成火焰伤害并附加烧伤状态。',
      'zh-TW': '對一名敵人造成火焰傷害並附加燒傷狀態。',
      en: 'Deals fire damage and applies Burn.',
      ja: '敵単体に炎ダメージを与え、火傷状態にする。',
      ko: '적 한 명에게 화염 피해를 주고 화상 상태로 만든다.'
    }
  },
  item_consumable_super_fire_bomb: {
    id: "item_consumable_super_fire_bomb",
    name: {
      zh: '超级火焰炸弹',
      'zh-TW': '超級火焰炸彈',
      en: 'Super Fire Bomb',
      ja: 'スーパーファイアボム',
      ko: '슈퍼 화염 폭탄'
    },
    type: "itemTypes.consumable",
    targetType: "allEnemies",
    effects: [
      { type: "damage", element: "fire", value: 300 },
      { type: "applyStatus", status: "status_burn", duration: 3, chance: 1.0 }
    ],
    icon: "icon_bomb",
    subText: {
      zh: '全体火焰+烧伤',
      'zh-TW': '全體火焰+燒傷',
      en: 'AOE Fire + Burn',
      ja: '全体炎+火傷',
      ko: '전체 화염+화상'
    },
    footerLeft: "itemTypes.consumable",
    description: {
      zh: '对所有敌人造成火焰伤害并附加烧伤状态。',
      'zh-TW': '對所有敵人造成火焰傷害並附加燒傷狀態。',
      en: 'Deals fire damage and applies Burn to all enemies.',
      ja: '敵全体に炎ダメージを与え、火傷状態にする。',
      ko: '적 전체에게 화염 피해를 주고 화상 상태로 만든다.'
    }
  },
  item_consumable_ice_bomb: {
    id: "item_consumable_ice_bomb",
    name: {
      zh: '冰冻炸弹',
      'zh-TW': '冰凍炸彈',
      en: 'Ice Bomb',
      ja: 'アイスボム',
      ko: '얼음 폭탄'
    },
    type: "itemTypes.consumable",
    targetType: "enemy",
    effects: [
      { type: "damage", element: "ice", value: 300 },
      { type: "applyStatus", status: "status_freeze", duration: 3, chance: 1.0 }
    ],
    icon: "icon_bomb_ice",
    subText: {
      zh: '冰冻伤害+冻结',
      'zh-TW': '冰凍傷害+凍結',
      en: 'Ice Dmg + Freeze',
      ja: '氷ダメージ+凍結',
      ko: '얼음 피해+동결'
    },
    footerLeft: "itemTypes.consumable",
    description: {
      zh: '对一名敌人造成冰冻伤害并附加冻结状态。',
      'zh-TW': '對一名敵人造成冰凍傷害並附加凍結狀態。',
      en: 'Deals ice damage and applies Freeze.',
      ja: '敵単体に氷ダメージを与え、凍結状態にする。',
      ko: '적 한 명에게 얼음 피해를 주고 동결 상태로 만든다.'
    }
  },
  item_consumable_super_ice_bomb: {
    id: "item_consumable_super_ice_bomb",
    name: {
      zh: '超级冰冻炸弹',
      'zh-TW': '超級冰凍炸彈',
      en: 'Super Ice Bomb',
      ja: 'スーパーアイスボム',
      ko: '슈퍼 얼음 폭탄'
    },
    type: "itemTypes.consumable",
    targetType: "allEnemies",
    effects: [
      { type: "damage", element: "ice", value: 300 },
      { type: "applyStatus", status: "status_freeze", duration: 3, chance: 1.0 }
    ],
    icon: "icon_bomb_ice",
    subText: {
      zh: '全体冰冻+冻结',
      'zh-TW': '全體冰凍+凍結',
      en: 'AOE Ice + Freeze',
      ja: '全体氷+凍結',
      ko: '전체 얼음+동결'
    },
    footerLeft: "itemTypes.consumable",
    description: {
      zh: '对所有敌人造成冰冻伤害并附加冻结状态。',
      'zh-TW': '對所有敵人造成冰凍傷害並附加凍結狀態。',
      en: 'Deals ice damage and applies Freeze to all enemies.',
      ja: '敵全体に氷ダメージを与え、凍結状態にする。',
      ko: '적 전체에게 얼음 피해를 주고 동결 상태로 만든다.'
    }
  },

  // --- Special / Full Restore (1501-1600) ---
  item_consumable_tent: {
    id: "item_consumable_tent",
    name: {
      zh: '野营帐篷',
      'zh-TW': '野營帳篷',
      en: 'Tent',
      ja: 'テント',
      ko: '텐트'
    },
    type: "itemTypes.consumable",
    targetType: "allAllies",
    effects: [
      { type: "fullRestore" }
    ],
    icon: "icon_tent",
    subText: {
      zh: '完全恢复',
      'zh-TW': '完全恢復',
      en: 'Full Recovery',
      ja: '全回復',
      ko: '완전 회복'
    },
    footerLeft: "itemTypes.consumable",
    description: {
      zh: '在存档点使用，完全恢复队伍状态。',
      'zh-TW': '在存檔點使用，完全恢復隊伍狀態。',
      en: 'Use at save points to fully recover party.',
      ja: 'セーブポイントで使用し、パーティを全回復する。',
      ko: '세이브 포인트에서 사용하여 파티를 완전히 회복한다.'
    }
  },

  // --- Cosmic Items (1601-1700) ---
  item_consumable_cosmic_frost_bang: {
    id: "item_consumable_cosmic_frost_bang",
    name: {
      zh: '宇宙冰霜大爆炸',
      'zh-TW': '宇宙冰霜大爆炸',
      en: 'Cosmic Frost Big Bang',
      ja: '宇宙の氷霜大爆発',
      ko: '우주 빙설 대폭발'
    },
    type: "itemTypes.consumable",
    targetType: "allUnits",
    effects: [
      { type: "damage", value: 2000 },
      { type: "applyStatus", status: "status_freeze", duration: 5, chance: 1.0 }
    ],
    icon: "icon_bomb_ice",
    subText: {
      zh: '全场 2000 + 冰封',
      'zh-TW': '全場 2000 + 冰封',
      en: 'Global 2000 + Freeze',
      ja: '全場 2000 + 凍結',
      ko: '전체 2000 + 동결'
    },
    footerLeft: "itemTypes.consumable",
    description: {
      zh: '引发宇宙级的冰霜爆炸，对场上所有人造成 2000 点伤害并冰封 5 回合。',
      'zh-TW': '引發宇宙級的冰霜爆炸，對場上所有人造成 2000 點傷害並冰封 5 回合。',
      en: 'Triggers a cosmic frost explosion, dealing 2000 damage and freezing everyone for 5 turns.',
      ja: '宇宙級の氷霜爆発を引き起こし、場にいる全員に2000ダメージと5ターンの凍結を与える。',
      ko: '우주급 빙설 폭발을 일으켜 전장의 모든 이에게 2000 피해를 입히고 5턴간 동결시킨다.'
    }
  },
  item_consumable_cosmic_thunder_bang: {
    id: "item_consumable_cosmic_thunder_bang",
    name: {
      zh: '宇宙雷暴大爆炸',
      'zh-TW': '宇宙雷暴大爆炸',
      en: 'Cosmic Thunder Big Bang',
      ja: '宇宙の雷鳴大爆発',
      ko: '우주 뇌우 대폭발'
    },
    type: "itemTypes.consumable",
    targetType: "allUnits",
    effects: [
      { type: "damage", value: 2000 },
      { type: "applyStatus", status: "status_paralysis", duration: 5, chance: 1.0 }
    ],
    icon: "icon_bomb",
    subText: {
      zh: '全场 2000 + 麻痹',
      'zh-TW': '全場 2000 + 麻痺',
      en: 'Global 2000 + Paralysis',
      ja: '全場 2000 + 麻痺',
      ko: '전체 2000 + 마비'
    },
    footerLeft: "itemTypes.consumable",
    description: {
      zh: '引发宇宙级的雷暴爆炸，对场上所有人造成 2000 点伤害并麻痹 5 回合。',
      'zh-TW': '引發宇宙級的雷暴爆炸，對場上所有人造成 2000 點傷害並麻痺 5 回合。',
      en: 'Triggers a cosmic thunder explosion, dealing 2000 damage and paralyzing everyone for 5 turns.',
      ja: '宇宙級の雷鳴爆発を引き起こし、場にいる全員に2000ダメージと5ターンの麻痺を与える。',
      ko: '우주급 뇌우 폭발을 일으켜 전장의 모든 이에게 2000 피해를 입히고 5턴간 마비시킨다.'
    }
  }
}
