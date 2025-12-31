export default {
  common: {
    confirm: '确认',
    cancel: '取消',
    back: '返回',
    close: '关闭',
    emptySlot: '空插槽',
    unknown: '未知'
  },
  menu: {
    start: '开始游戏',
    continue: '继续游戏',
    settings: '设置',
    exit: '退出游戏'
  },
  system: {
    language: '语言',
    volume: '音量',
    save: '保存进度',
    load: '读取进度'
  },
  panels: {
    inventory: '背包',
    equipment: '装备',
    skills: '技能',
    status: '状态',
    shop: '商店',
    encyclopedia: '图鉴',
    thank: '致谢',
    data: '存档'
  },
  stats: {
    hp: '生命值',
    mp: '魔法值',
    atk: '攻击力',
    def: '防御力',
    matk: '魔法攻击',
    mdef: '魔法防御',
    agi: '敏捷',
    luck: '幸运'
  },
  roles: {
    swordsman: '剑士',
    gunner: '枪手',
    mage: '法师',
    brawler: '格斗家'
  },
  elements: {
    fire: '火',
    ice: '冰',
    lightning: '雷',
    light: '光',
    windLight: '风/光'
  },
  weapons: {
    sword: '剑',
    rifle: '步枪',
    book: '典籍',
    gauntlets: '护手'
  },
  itemTypes: {
    consumable: '消耗品',
    weapon: '武器',
    armor: '防具',
    accessory: '饰品',
    keyItem: '关键道具'
  },
  skillTypes: {
    active: '主动',
    passive: '被动'
  },
  skillCategories: {
    physical: '物理',
    magic: '魔法',
    support: '辅助',
    passive: '被动'
  },
  statusTypes: {
    buff: '增益',
    debuff: '减益'
  },
  labels: {
    element: '元素',
    weapon: '武器',
    role: '职业',
    type: '类型',
    effect: '效果',
    category: '分类',
    cost: '消耗'
  },
  dev: {
    title: '开发者操作面板',
    systemSwitcher: '系统切换器',
    debugActions: '调试操作',
    systems: {
      mainMenu: '主菜单 (开始画面)',
      listMenu: '列表菜单系统',
      shop: '商店系统',
      encyclopedia: '图鉴系统',
      battle: '战斗系统 (开发中)',
      worldMap: '世界地图系统'
    },
    actions: {
      addGold: '添加 1000 金币',
      logState: '打印状态'
    }
  },
  worldMap: {
    position: '位置',
    lastInput: '最后输入',
    moveControls: '移动: WASD / 方向键 (Shift = 加速)'
  },
  shop: {
    title: '武器商店',
    welcome: '欢迎，旅行者！来看看我的商品吧。',
    keeperSpeech: '我这有王国里最好的剑！',
    buy: '购买',
    yourGold: '持有金币',
    exit: '离开商店'
  },
  mainMenu: {
    title: '神彩怒放',
    subTitlePrefix: '~序~',
    subTitleMain: '惡性饥寒',
    copyright: '版权所有 © 2024 开发者'
  },
  listMenu: {
    gold: '金币',
    time: '时间'
  },
  encyclopedia: {
    description: '描述',
    baseStats: '基础属性'
  },
  inventory: {
    tabs: {
        all: '全部'
    },
    views: {
        list: '列表视图',
        card: '卡片视图',
        grid: '网格视图'
    }
  },
  saveLoad: {
    file: '存档',
    empty: '空',
    level: '等级',
    gold: '金币',
    date: '日期',
    delete: '删除',
    save: '保存',
    load: '读取',
    playTime: '游戏时间',
    location: '地点'
  },
  skills: {
    tabs: {
        all: '全部技能'
    },
    cost: '消耗',
    target: '目标',
    type: '类型',
    unequip: '卸下',
    upgrade: '升级',
    locked: '未解锁',
    equipped: '已装备'
  },
  systemSettings: {
    gameplay: '游戏设置',
    textSpeed: '文本速度',
    autoSave: '自动保存',
    toTitle: '返回标题',
    music: '音乐',
    soundEffects: '音效',
    masterVolume: '主音量',
    speeds: {
        slow: '慢',
        normal: '中',
        fast: '快'
    }
  },
  thank: {
    title: '制作人员',
    devTeam: '开发团队',
    specialThanks: '特别感谢',
    footer: '感谢游玩！'
  },
  equipment: {
    comparison: '对比',
    weight: '重量',
    selectWeapon: '选择武器',
    itemsAvailable: '可用物品',
    equipped: '已装备'
  },
  characters: {
    1: {
      name: '奥尔芬',
      description: '失去记忆与痛觉的神秘剑士。挥舞着一把燃烧的剑。'
    },
    2: {
      name: '希侬',
      description: '身负“荆棘”诅咒的女子，触碰者皆会感到剧痛。优秀的射手与治疗者。'
    },
    3: {
      name: '琳薇尔',
      description: '一族中最后的魔法师。虽然身体孱弱，但能施展强大的星灵术。'
    },
    4: {
      name: '洛',
      description: '热血的武术家，用拳脚进行战斗。身手敏捷，打击沉重。'
    }
  },
  items: {
    1001: {
      name: '药水',
      subText: '恢复 50 HP',
      footerLeft: '恢复 HP',
      description: '由草药制成的基本药剂。恢复少量生命值。冒险者必备。'
    },
    1002: {
      name: '强力药水',
      subText: '恢复 150 HP',
      footerLeft: '恢复 HP++',
      description: '强效药剂。恢复中量生命值。'
    },
    1003: {
      name: '乙太',
      subText: '恢复 20 MP',
      footerLeft: '恢复 MP',
      description: '恢复精神能量的神奇液体。味道略苦。'
    },
    1004: {
      name: '解毒剂',
      subText: '治愈中毒',
      footerLeft: '治愈中毒',
      description: '用于治疗中毒的草药解毒剂。即刻见效。'
    },
    1005: {
      name: '帐篷',
      subText: '全队恢复',
      footerLeft: '全员休息',
      description: '便携式住所。允许整个队伍在存档点休息并完全恢复 HP 和 MP。'
    },
    1006: {
      name: '凤凰尾羽',
      subText: '复活',
      footerLeft: '复活盟友',
      description: '传说中鸟类的尾羽。复活倒下的盟友并恢复少量 HP。'
    },
    2001: {
      name: '铁剑',
      subText: '攻击力 +15',
      footerLeft: '基础剑',
      description: '标准的铁剑。可靠且坚固。'
    },
    2002: {
      name: '钢刀',
      subText: '攻击力 +35',
      footerLeft: '锋利',
      description: '由钢锻造的锋利刀刃。可以轻松切开轻甲。'
    },
    2003: {
      name: '秘银匕首',
      subText: '攻击力 +25, 速度 +5',
      footerLeft: '轻量',
      description: '由秘银制成的精美匕首。非常轻便，易于操作。'
    },
    2004: {
      name: '木杖',
      subText: '魔力 +10',
      footerLeft: '法师工具',
      description: '由橡木雕刻而成的简单手杖。可以稍微引导魔法能量。'
    },
    3001: {
      name: '皮背心',
      subText: '防御力 +10',
      footerLeft: '轻甲',
      description: '由鞣制皮革制成的背心。提供基本保护。'
    },
    3002: {
      name: '锁子甲',
      subText: '防御力 +25',
      footerLeft: '中型护甲',
      description: '由互锁的金属环制成的盔甲。对劈砍攻击有良好的防护作用。'
    },
    3003: {
      name: '丝绸长袍',
      subText: '防御力 +5, 魔力 +15',
      footerLeft: '法师长袍',
      description: '由魔法丝绸编织而成的长袍。增强魔法力量，但物理防御力较低。'
    },
    4001: {
      name: '力量戒指',
      subText: '力量 +5',
      footerLeft: '力量',
      description: '镶嵌着红色宝石的戒指。佩戴者会感到力量涌动。'
    },
    4002: {
      name: '守护戒指',
      subText: '防御力 +5',
      footerLeft: '防御',
      description: '镶嵌着蓝色宝石的戒指。散发出微弱的保护光环。'
    },
    9001: {
      name: '世界地图',
      subText: '达纳地区',
      footerLeft: '导航',
      description: '已知世界的详细地图。旅行必备。'
    },
    9002: {
      name: '生锈的钥匙',
      subText: '旧铁钥匙',
      footerLeft: '开启门扉',
      description: '在废墟中发现的旧生锈钥匙。可能会打开附近的某扇门。'
    }
  },
  skills: {
    101: {
      name: '斩击',
      subText: '基础攻击',
      description: '用武器快速挥砍。对单个敌人造成 100% 物理伤害。'
    },
    102: {
      name: '强力击',
      subText: '重伤',
      description: '强力的蓄力攻击。造成 200% 物理伤害，但有几率未命中。'
    },
    201: {
      name: '火球术',
      subText: '火属性伤害',
      description: '向敌人投掷火球。造成火属性伤害并可能造成燃烧。'
    },
    202: {
      name: '冰锥术',
      subText: '冰属性伤害',
      description: '射出锋利的冰柱。造成冰属性伤害并降低目标速度。'
    },
    203: {
      name: '雷电术',
      subText: '范围雷电',
      description: '召唤雷电打击所有敌人。造成中等雷属性伤害。'
    },
    301: {
      name: '治疗术',
      subText: '恢复 HP',
      description: '为单个盟友恢复中量 HP。'
    },
    302: {
      name: '护盾',
      subText: '提升防御',
      description: '增加盟友的物理防御力，持续 3 回合。'
    },
    401: {
      name: '钢铁皮肤',
      subText: '防御提升',
      description: '永久增加 10% 物理防御力。'
    },
    402: {
      name: '法力流',
      subText: 'MP 再生',
      description: '每回合结束时恢复 5% 最大 MP。'
    }
  },
  status: {
    1: {
      name: '中毒',
      subText: '持续伤害',
      description: '每回合开始时受到伤害。战斗结束后持续。'
    },
    2: {
      name: '燃烧',
      subText: '持续伤害',
      description: '每回合受到火属性伤害。降低攻击力。'
    },
    3: {
      name: '冻结',
      subText: '眩晕',
      description: '无法行动。受到物理伤害会击碎冰块并造成双倍伤害。'
    },
    4: {
      name: '麻痹',
      subText: '几率眩晕',
      description: '每回合有 25% 的几率无法行动。'
    },
    101: {
      name: '再生',
      subText: '治疗',
      description: '每回合开始时恢复少量 HP。'
    },
    102: {
      name: '攻击提升',
      subText: '攻击力 +',
      description: '增加物理攻击力。'
    },
    103: {
      name: '急速',
      subText: '速度 +',
      description: '增加速度，使回合更快到来。'
    }
  }
}
