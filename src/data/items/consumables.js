export default {
  // --- HP Recovery (1001-1100) ---
  item_consumable_potion: {
    id: "item_consumable_potion",
    name: {
      zh: '回复药水',
      'zh-TW': '回復藥水',
      en: 'Potion',
      ja: 'ポーション',
      ko: '포션'
    },
    type: "itemTypes.consumable",
    targetType: "ally",
    effects: [
      { type: "heal", value: 50 }
    ],
    icon: "icon_potion",
    subText: {
      zh: 'HP +50',
      'zh-TW': 'HP +50',
      en: 'HP +50',
      ja: 'HP +50',
      ko: 'HP +50'
    },
    footerLeft: "itemTypes.consumable",
    description: {
      zh: '恢复少量生命值的药水。',
      'zh-TW': '恢復少量生命值的藥水。',
      en: 'Restores a small amount of HP.',
      ja: 'HPを少量回復する薬。',
      ko: 'HP를 소량 회복하는 물약.'
    }
  },
  item_consumable_hi_potion: {
    id: "item_consumable_hi_potion",
    name: {
      zh: '高级回复药水',
      'zh-TW': '高級回復藥水',
      en: 'Hi-Potion',
      ja: 'ハイポーション',
      ko: '하이 포션'
    },
    type: "itemTypes.consumable",
    targetType: "ally",
    effects: [
      { type: "heal", value: 200 }
    ],
    icon: "icon_potion",
    subText: {
      zh: 'HP +200',
      'zh-TW': 'HP +200',
      en: 'HP +200',
      ja: 'HP +200',
      ko: 'HP +200'
    },
    footerLeft: "itemTypes.consumable",
    description: {
      zh: '恢复中量生命值的药水。',
      'zh-TW': '恢復中量生命值的藥水。',
      en: 'Restores a moderate amount of HP.',
      ja: 'HPを中量回復する薬。',
      ko: 'HP를 중량 회복하는 물약.'
    }
  },
  item_consumable_splash_potion: {
    id: "item_consumable_splash_potion",
    name: {
      zh: '大范围喷溅治疗药水',
      'zh-TW': '大範圍噴濺治療藥水',
      en: 'Splashing Healing Potion',
      ja: 'スプラッシュポーション',
      ko: '스플래시 포션'
    },
    type: "itemTypes.consumable",
    targetType: "allAllies",
    effects: [
      { type: "heal_all", value: 300 }
    ],
    icon: "icon_potion_splash",
    subText: {
      zh: '群体回复',
      'zh-TW': '群體回復',
      en: 'Mass Heal',
      ja: '全体回復',
      ko: '전체 회복'
    },
    footerLeft: "itemTypes.consumable",
    description: {
      zh: '恢复所有队友的生命值。',
      'zh-TW': '恢復所有隊友的生命值。',
      en: 'Restores HP to all allies.',
      ja: '味方全員のHPを回復する。',
      ko: '아군 전원의 HP를 회복시킨다.'
    }
  },

  // --- MP Recovery (1101-1200) ---
  item_consumable_ether: {
    id: "item_consumable_ether",
    name: {
      zh: '魔法药水',
      'zh-TW': '魔法藥水',
      en: 'Ether',
      ja: 'エーテル',
      ko: '에테르'
    },
    type: "itemTypes.consumable",
    targetType: "ally",
    effects: [
      { type: "recoverMp", value: 50 }
    ],
    icon: "icon_potion",
    subText: {
      zh: 'MP +50',
      'zh-TW': 'MP +50',
      en: 'MP +50',
      ja: 'MP +50',
      ko: 'MP +50'
    },
    footerLeft: "itemTypes.consumable",
    description: {
      zh: '恢复少量魔法值的药水。',
      'zh-TW': '恢復少量魔法值的藥水。',
      en: 'Restores a small amount of MP.',
      ja: 'MPを少量回復する薬。',
      ko: 'MP를 소량 회복하는 물약.'
    }
  },

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
  }
}
