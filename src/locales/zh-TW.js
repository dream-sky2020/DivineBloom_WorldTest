export default {
  common: {
    confirm: '確認',
    cancel: '取消',
    back: '返回',
    close: '關閉',
    emptySlot: '空插槽',
    unknown: '未知'
  },
  menu: {
    start: '開始遊戲',
    continue: '繼續遊戲',
    settings: '設定',
    exit: '退出遊戲'
  },
  system: {
    language: '語言',
    volume: '音量',
    save: '儲存進度',
    load: '讀取進度'
  },
  panels: {
    inventory: '背包',
    equipment: '裝備',
    skills: '技能',
    status: '狀態',
    shop: '商店',
    encyclopedia: '圖鑑',
    thank: '致謝',
    data: '存檔'
  },
  stats: {
    hp: '生命值',
    mp: '魔法值',
    atk: '攻擊力',
    def: '防禦力',
    matk: '魔法攻擊',
    mdef: '魔法防禦',
    agi: '敏捷',
    luck: '幸運'
  },
  roles: {
    swordsman: '劍士',
    gunner: '槍手',
    mage: '法師',
    brawler: '格鬥家'
  },
  elements: {
    fire: '火',
    ice: '冰',
    lightning: '雷',
    light: '光',
    windLight: '風/光'
  },
  weapons: {
    sword: '劍',
    rifle: '步槍',
    book: '典籍',
    gauntlets: '護手'
  },
  itemTypes: {
    consumable: '消耗品',
    weapon: '武器',
    armor: '防具',
    accessory: '飾品',
    keyItem: '關鍵道具'
  },
  skillTypes: {
    active: '主動',
    passive: '被動'
  },
  skillCategories: {
    physical: '物理',
    magic: '魔法',
    support: '輔助',
    passive: '被動'
  },
  statusTypes: {
    buff: '增益',
    debuff: '減益'
  },
  labels: {
    element: '元素',
    weapon: '武器',
    role: '職業',
    type: '類型',
    effect: '效果',
    category: '分類',
    cost: '消耗'
  },
  dev: {
    title: '開發者操作面板',
    systemSwitcher: '系統切換器',
    debugActions: '除錯操作',
    systems: {
      mainMenu: '主選單 (開始畫面)',
      listMenu: '列表選單系統',
      shop: '商店系統',
      encyclopedia: '圖鑑系統',
      battle: '戰鬥系統 (開發中)',
      worldMap: '世界地圖系統'
    },
    actions: {
      addGold: '添加 1000 金幣',
      logState: '列印狀態'
    }
  },
  worldMap: {
    position: '位置',
    lastInput: '最後輸入',
    moveControls: '移動: WASD / 方向鍵 (Shift = 加速)'
  },
  shop: {
    title: '武器商店',
    welcome: '歡迎，旅行者！來看看我的商品吧。',
    keeperSpeech: '我這有王國裡最好的劍！',
    buy: '購買',
    yourGold: '持有金幣',
    exit: '離開商店'
  },
  mainMenu: {
    title: '神彩怒放',
    subTitlePrefix: '~序~',
    subTitleMain: '惡性饑寒',
    copyright: '版權所有 © 2024 開發者'
  },
  listMenu: {
    gold: '金幣',
    time: '時間'
  },
  encyclopedia: {
    description: '描述',
    baseStats: '基礎屬性'
  },
  inventory: {
    tabs: {
        all: '全部'
    },
    views: {
        list: '列表視圖',
        card: '卡片視圖',
        grid: '網格視圖'
    }
  },
  saveLoad: {
    file: '存檔',
    empty: '空',
    level: '等級',
    gold: '金幣',
    date: '日期',
    delete: '刪除',
    save: '儲存',
    load: '讀取',
    playTime: '遊戲時間',
    location: '地點'
  },
  skills: {
    tabs: {
        all: '全部技能'
    },
    cost: '消耗',
    target: '目標',
    type: '類型',
    unequip: '卸下',
    upgrade: '升級',
    locked: '未解鎖',
    equipped: '已裝備'
  },
  systemSettings: {
    gameplay: '遊戲設定',
    textSpeed: '文本速度',
    autoSave: '自動儲存',
    toTitle: '返回標題',
    music: '音樂',
    soundEffects: '音效',
    masterVolume: '主音量',
    speeds: {
        slow: '慢',
        normal: '中',
        fast: '快'
    }
  },
  thank: {
    title: '製作人員',
    devTeam: '開發團隊',
    specialThanks: '特別感謝',
    footer: '感謝遊玩！'
  },
  equipment: {
    comparison: '對比',
    weight: '重量',
    selectWeapon: '選擇武器',
    itemsAvailable: '可用物品',
    equipped: '已裝備'
  },
  characters: {
    1: {
      name: '奧爾芬',
      description: '失去記憶與痛覺的神秘劍士。揮舞著一把燃燒的劍。'
    },
    2: {
      name: '希儂',
      description: '身負「荊棘」詛咒的女子，觸碰者皆會感到劇痛。優秀的射手與治療者。'
    },
    3: {
      name: '琳薇爾',
      description: '一族中最後的魔法師。雖然身體孱弱，但能施展強大的星靈術。'
    },
    4: {
      name: '洛',
      description: '熱血的武術家，用拳腳進行戰鬥。身手敏捷，打擊沉重。'
    }
  },
  items: {
    1001: {
      name: '藥水',
      subText: '恢復 50 HP',
      footerLeft: '恢復 HP',
      description: '由草藥製成的基本藥劑。恢復少量生命值。冒險者必備。'
    },
    1002: {
      name: '強力藥水',
      subText: '恢復 150 HP',
      footerLeft: '恢復 HP++',
      description: '強效藥劑。恢復中量生命值。'
    },
    1003: {
      name: '乙太',
      subText: '恢復 20 MP',
      footerLeft: '恢復 MP',
      description: '恢復精神能量的神奇液體。味道略苦。'
    },
    1004: {
      name: '解毒劑',
      subText: '治癒中毒',
      footerLeft: '治癒中毒',
      description: '用於治療中毒的草藥解毒劑。即刻見效。'
    },
    1005: {
      name: '帳篷',
      subText: '全隊恢復',
      footerLeft: '全員休息',
      description: '便攜式住所。允許整個隊伍在存檔點休息並完全恢復 HP 和 MP。'
    },
    1006: {
      name: '鳳凰尾羽',
      subText: '復活',
      footerLeft: '復活盟友',
      description: '傳說中鳥類的尾羽。復活倒下的盟友並恢復少量 HP。'
    },
    2001: {
      name: '鐵劍',
      subText: '攻擊力 +15',
      footerLeft: '基礎劍',
      description: '標準的鐵劍。可靠且堅固。'
    },
    2002: {
      name: '鋼刀',
      subText: '攻擊力 +35',
      footerLeft: '鋒利',
      description: '由鋼鍛造的鋒利刀刃。可以輕鬆切開輕甲。'
    },
    2003: {
      name: '秘銀匕首',
      subText: '攻擊力 +25, 速度 +5',
      footerLeft: '輕量',
      description: '由秘銀製成的精美匕首。非常輕便，易於操作。'
    },
    2004: {
      name: '木杖',
      subText: '魔力 +10',
      footerLeft: '法師工具',
      description: '由橡木雕刻而成的簡單手杖。可以稍微引導魔法能量。'
    },
    3001: {
      name: '皮背心',
      subText: '防禦力 +10',
      footerLeft: '輕甲',
      description: '由鞣製皮革製成的背心。提供基本保護。'
    },
    3002: {
      name: '鎖子甲',
      subText: '防禦力 +25',
      footerLeft: '中型護甲',
      description: '由互鎖的金屬環製成的盔甲。對劈砍攻擊有良好的防護作用。'
    },
    3003: {
      name: '絲綢長袍',
      subText: '防禦力 +5, 魔力 +15',
      footerLeft: '法師長袍',
      description: '由魔法絲綢編織而成的長袍。增強魔法力量，但物理防禦力較低。'
    },
    4001: {
      name: '力量戒指',
      subText: '力量 +5',
      footerLeft: '力量',
      description: '鑲嵌著紅色寶石的戒指。佩戴者會感到力量湧動。'
    },
    4002: {
      name: '守護戒指',
      subText: '防禦力 +5',
      footerLeft: '防禦',
      description: '鑲嵌著藍色寶石的戒指。散發出微弱的保護光環。'
    },
    9001: {
      name: '世界地圖',
      subText: '達納地區',
      footerLeft: '導航',
      description: '已知世界的詳細地圖。旅行必備。'
    },
    9002: {
      name: '生鏽的鑰匙',
      subText: '舊鐵鑰匙',
      footerLeft: '開啟門扉',
      description: '在廢墟中發現的舊生鏽鑰匙。可能會打開附近的某扇門。'
    }
  },
  skills: {
    101: {
      name: '斬擊',
      subText: '基礎攻擊',
      description: '用武器快速揮砍。對單個敵人造成 100% 物理傷害。'
    },
    102: {
      name: '強力擊',
      subText: '重傷',
      description: '強力的蓄力攻擊。造成 200% 物理傷害，但有幾率未命中。'
    },
    201: {
      name: '火球術',
      subText: '火屬性傷害',
      description: '向敵人投擲火球。造成火屬性傷害並可能造成燃燒。'
    },
    202: {
      name: '冰錐術',
      subText: '冰屬性傷害',
      description: '射出鋒利的冰柱。造成冰屬性傷害並降低目標速度。'
    },
    203: {
      name: '雷電術',
      subText: '範圍雷電',
      description: '召喚雷電打擊所有敵人。造成中等雷屬性傷害。'
    },
    301: {
      name: '治療術',
      subText: '恢復 HP',
      description: '為單個盟友恢復中量 HP。'
    },
    302: {
      name: '護盾',
      subText: '提升防禦',
      description: '增加盟友的物理防禦力，持續 3 回合。'
    },
    401: {
      name: '鋼鐵皮膚',
      subText: '防禦提升',
      description: '永久增加 10% 物理防禦力。'
    },
    402: {
      name: '法力流',
      subText: 'MP 再生',
      description: '每回合結束時恢復 5% 最大 MP。'
    }
  },
  status: {
    1: {
      name: '中毒',
      subText: '持續傷害',
      description: '每回合開始時受到傷害。戰鬥結束後持續。'
    },
    2: {
      name: '燃燒',
      subText: '持續傷害',
      description: '每回合受到火屬性傷害。降低攻擊力。'
    },
    3: {
      name: '凍結',
      subText: '眩暈',
      description: '無法行動。受到物理傷害會擊碎冰塊並造成雙倍傷害。'
    },
    4: {
      name: '麻痺',
      subText: '幾率眩暈',
      description: '每回合有 25% 的幾率無法行動。'
    },
    101: {
      name: '再生',
      subText: '治療',
      description: '每回合開始時恢復少量 HP。'
    },
    102: {
      name: '攻擊提升',
      subText: '攻擊力 +',
      description: '增加物理攻擊力。'
    },
    103: {
      name: '急速',
      subText: '速度 +',
      description: '增加速度，使回合更快到來。'
    }
  }
}

