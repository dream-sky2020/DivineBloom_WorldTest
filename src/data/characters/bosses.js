export default {
  'character_emperor_shenwu': {
    atb: -100,
    id: 'character_emperor_shenwu',
    name: {
      zh: '神武皇帝',
      'zh-TW': '神武皇帝',
      en: 'Emperor Shenwu',
      ja: '神武皇帝',
      ko: '신무 황제'
    },
    role: "roles.emperor",
    element: "element_divine",
    weaponType: "weapons.sword",
    isBoss: true,
    tags: ['roles.boss', 'element_divine', 'status_phys_attr', 'status_strength'],
    color: '#fbbf24', // Gold
    hp: 50000,
    mp: 9999,
    atk: 50,
    def: 40,
    mag: 40,
    spd: 10,
    description: {
      zh: '神戮兵装的持有者，立誓通过武力终结一切混乱的霸主。',
      'zh-TW': '神戮兵裝的持有者，立誓通過武力終結一切混亂的霸主。',
      en: 'Wielder of the God-Slaying Armament, a hegemon sworn to end all chaos through force.',
      ja: '神殺しの兵装を持つ者、武力ですべての混沌を終わらせると誓った覇王。',
      ko: '신을 죽이는 무구의 소유자, 무력으로 모든 혼란을 끝내겠다고 맹세한 패왕.'
    },
    drops: [
      { itemId: 'item_material_divine_shard', chance: 1.0, minQty: 1, maxQty: 1 }, // Divine Shard (100%)
      { itemId: 'item_material_chaos_crystal', chance: 0.5, minQty: 1, maxQty: 1 }  // Chaos Crystal
    ]
  },
  'character_shahryar': {
    atb: -100,
    id: 'character_shahryar',
    name: {
      zh: '山鲁亚尔',
      'zh-TW': '山魯亞爾',
      en: 'Shahryar',
      ja: 'シャフリヤール',
      ko: '샤흐리야르'
    },
    role: "roles.king",
    element: "element_nihility",
    weaponType: "weapons.scimitar",
    isBoss: true,
    tags: ['roles.boss', 'element_nihility', 'status_mental'],
    color: '#94a3b8', // Slate/Silver
    hp: 45000,
    mp: 9999,
    atk: 45,
    def: 35,
    mag: 50,
    spd: 15,
    description: {
      zh: '看破轮回虚无的国王，试图毁灭许愿术核心以赐予众生彻底的解脱。',
      'zh-TW': '看破輪迴虛無的國王，試圖毀滅許願術核心以賜予眾生徹底的解脫。',
      en: 'The king who saw through the nihilism of reincarnation, seeking to destroy the core of the wish spell to grant ultimate liberation.',
      ja: '輪廻の虚無を見抜いた王、願いの術の核を破壊し、衆生に完全な解脱を与えようとする。',
      ko: '윤회의 허무를 간파한 왕, 소원 주문의 핵심을 파괴하여 중생에게 완전한 해탈을 주려 한다.'
    },
    drops: [
      { itemId: 'item_material_void_dust', chance: 1.0, minQty: 1, maxQty: 2 }, // Void Dust
      { itemId: 'item_consumable_elixir', chance: 0.8, minQty: 1, maxQty: 1 }     // Elixir
    ]
  },
  'character_hefietian': {
    atb: -100,
    id: 'character_hefietian',
    name: {
      zh: '赫绯天',
      'zh-TW': '赫緋天',
      en: 'Hefietian',
      ja: 'ハー・フェイティアン',
      ko: '헤페이티안'
    },
    role: "roles.god_slayer",
    element: "element_chaos",
    weaponType: "weapons.scythe",
    isBoss: true,
    tags: ['roles.boss', 'element_chaos', 'status_phys_attr', 'status_strength'],
    color: '#ef4444',
    hp: 60000,
    mp: 9999,
    atk: 60,
    def: 45,
    mag: 55,
    spd: 20,
    description: {
      zh: '屠灭所有神明的非人神。',
      'zh-TW': '屠滅所有神明的非人神。',
      en: 'A non-human god who slaughters all deities.',
      ja: 'すべての神を屠る非人の神。',
      ko: '모든 신을 학살하는 비인간 신.'
    },
    drops: [
      { itemId: 'item_material_chaos_crystal', chance: 1.0, minQty: 1, maxQty: 1 }, // Chaos Crystal
      { itemId: 'item_material_divine_shard', chance: 0.2, minQty: 1, maxQty: 1 }  // Divine Shard
    ]
  },
  'character_yibitian': {
    atb: -100,
    id: 'character_yibitian',
    name: {
      zh: '疫碧天',
      'zh-TW': '疫碧天',
      en: 'Yibitian',
      ja: 'イビティアン',
      ko: '이비천'
    },
    role: "roles.god_slayer",
    element: "element_water",
    weaponType: "weapons.scythe",
    isBoss: true,
    tags: ['roles.boss', 'element_water', 'char_yibitian', 'status_mental'],
    color: '#10b981',
    hp: 70000,
    mp: 9999,
    atk: 50,
    def: 50,
    mag: 65,
    spd: 22,
    description: {
      zh: '屠灭所有神明的非人神。',
      'zh-TW': '屠滅所有神明的非人神。',
      en: 'A non-human god who slaughters all deities.',
      ja: 'すべての神を屠る非人の神。',
      ko: '모든 신을 학살하는 비인간 신.'
    },
    drops: [
      { itemId: 'item_material_plague_essence', chance: 1.0, minQty: 1, maxQty: 1 }, // Plague Essence
      { itemId: 'item_material_slime_gel', chance: 1.0, minQty: 5, maxQty: 10 } // Slime Gel (Why not?)
    ]
  }
}

