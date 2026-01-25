export default {
  'character_slime': {
    id: 'character_slime',
    name: { zh: '史莱姆', 'zh-TW': '史萊姆', en: 'Slime', ja: 'スライム', ko: '슬라임' },
    role: "roles.monster",
    element: "element_water",
    weaponType: "weapons.none",
    hp: 150, mp: 0, atk: 10, def: 5, mag: 0, spd: 8,
    skills: ['skill_enemy_slime_shot', 'skill_passive_attack_up', 'skill_passive_call_of_death'], // Slime Shot (Active) + Attack Up (Passive)
    tags: ['roles.monster', 'element_water', 'status_elemental', 'trait_nature'],
    spriteId: 'enemy_slime',
    description: { 
      zh: '常见的胶状怪物。', 
      'zh-TW': '常見的膠狀怪物。',
      en: 'A common gelatinous monster.',
      ja: '一般的なゼリー状のモンスター。',
      ko: '일반적인 젤리 형태의 몬스터.'
    },
    drops: [
      { itemId: 'item_material_slime_gel', chance: 0.8, minQty: 1, maxQty: 2 }, // Slime Gel
      { itemId: 'item_consumable_potion', chance: 0.1, minQty: 1, maxQty: 1 }     // Potion (example)
    ]
  },
  'character_vampire_bat': {
    id: 'character_vampire_bat',
    name: { zh: '吸血蝙蝠', 'zh-TW': '吸血蝙蝠', en: 'Vampire Bat', ja: '吸血コウモリ', ko: '흡혈 박쥐' },
    role: "roles.monster",
    element: "element_wind",
    weaponType: "weapons.none",
    hp: 100, mp: 20, atk: 12, def: 2, mag: 5, spd: 18,
    skills: ['skill_enemy_vampiric_bite', 'skill_passive_call_of_death'], // Vampiric Bite
    tags: ['roles.monster', 'element_wind', 'status_elemental'],
    spriteId: 'default',
    description: { 
      zh: '行动敏捷的飞行怪物。', 
      'zh-TW': '行動敏捷的飛行怪物。',
      en: 'An agile flying monster.',
      ja: '動きの素早い飛行モンスター。',
      ko: '행동이 민첩한 비행 몬스터.'
    },
    drops: [
      { itemId: 'item_material_bat_fang', chance: 0.6, minQty: 1, maxQty: 1 } // Bat Fang
    ]
  },
  'character_wasteland_wolf': {
    id: 'character_wasteland_wolf',
    name: { zh: '荒原狼', 'zh-TW': '荒原狼', en: 'Wasteland Wolf', ja: '荒野の狼', ko: '황무지 늑대' },
    role: "roles.monster",
    element: "element_earth",
    weaponType: "weapons.claw",
    hp: 300, mp: 0, atk: 20, def: 8, mag: 0, spd: 14,
    skills: ['skill_enemy_pack_bite', 'skill_passive_attack_up', 'skill_passive_call_of_death'], // Pack Bite + Attack Up
    tags: ['roles.monster', 'element_earth', 'status_phys_attr'],
    spriteId: 'default',
    description: { 
      zh: '凶猛的群居野兽。', 
      'zh-TW': '凶猛的群居野獸。',
      en: 'A ferocious pack beast.',
      ja: '凶暴な群れをなす野獣。',
      ko: '흉포한 무리 생활을 하는 야수.'
    },
    drops: [
      { itemId: 'item_material_wolf_pelt', chance: 0.5, minQty: 1, maxQty: 1 }, // Wolf Pelt
      { itemId: 'item_material_bat_fang', chance: 0.2, minQty: 1, maxQty: 1 }  // Bat Fang (maybe they ate a bat?) - Just example
    ]
  },
  'character_heavy_guard': {
    id: 'character_heavy_guard',
    name: { zh: '重装守卫', 'zh-TW': '重裝守衛', en: 'Heavy Guard', ja: 'ヘビーガード', ko: '헤비 가드' },
    role: "roles.monster",
    element: "element_metal",
    weaponType: "weapons.shield",
    hp: 500, mp: 50, atk: 25, def: 20, mag: 0, spd: 6,
    skills: ['skill_enemy_shield_bash', 'skill_support_shield', 'skill_passive_call_of_death'], // Shield Bash + Shield (Buff)
    tags: ['roles.monster', 'element_metal', 'status_phys_attr', 'status_armor'],
    spriteId: 'default',
    description: { 
      zh: '全副武装的巡逻者。', 
      'zh-TW': '全副武裝的巡邏者。',
      en: 'A fully armed patroller.',
      ja: '完全武装したパトロール。',
      ko: '완전 무장한 순찰자.'
    },
    drops: [
      { itemId: 'item_material_iron_scrap', chance: 0.7, minQty: 1, maxQty: 3 }, // Iron Scrap
      { itemId: 'item_consumable_elixir', chance: 0.1, minQty: 1, maxQty: 1 }     // Elixir
    ]
  },
  'character_wounded_scout': {
    id: 'character_wounded_scout',
    name: { 
      zh: '负伤的斥候', 
      'zh-TW': '負傷的斥候',
      en: 'Wounded Scout',
      ja: '負傷した斥候',
      ko: '부상당한 정찰병'
    },
    role: "roles.monster",
    element: "element_wind",
    weaponType: "weapons.dagger",
    hp: 200, mp: 10, atk: 15, def: 5, mag: 0, spd: 15,
    // 演示：开场半血，且自带流血状态
    currentHp: 100,
    statusEffects: [
      { id: 'status_bleed', duration: 5 }
    ],
    tags: ['roles.monster', 'element_wind', 'status_phys_attr', 'status_blood', 'trait_dying'],
    spriteId: 'default',
    description: { 
      zh: '一名在战斗中负伤的敌人斥候，看起来已经虚弱不堪。', 
      'zh-TW': '一名在戰鬥中負傷的敵人斥候，看起來已經虛弱不堪。',
      en: 'An enemy scout wounded in battle, looking quite weak.',
      ja: '戦闘で負傷した敵の斥候。かなり弱っているようだ。',
      ko: '전투 중 부상을 입은 적군 정찰병입니다. 매우 약해 보입니다.'
    },
    drops: [
      { itemId: 'item_material_slime_gel', chance: 0.5, minQty: 1, maxQty: 1 }
    ]
  },
  'character_flesh_sprite': {
    id: 'character_flesh_sprite',
    name: { zh: '食肉精灵', 'zh-TW': '食肉精靈', en: 'Flesh Sprite', ja: '肉食精霊', ko: '식육 정령' },
    role: "roles.monster",
    element: "element_wind",
    weaponType: "weapons.none",
    hp: 400, mp: 100, atk: 35, def: 15, mag: 40, spd: 25,
    skills: ['skill_passive_sprite_rebirth', 'skill_enemy_vampiric_bite'],
    tags: ['roles.monster', 'element_wind', 'trait_spirit', 'trait_rebirth'],
    spriteId: 'default',
    description: { 
      zh: '一种贪婪的精灵，即便肉身毁灭也能通过灵体不断重生。', 
      'zh-TW': '一種貪婪的精靈，即便肉身毀滅也能通過靈體不斷重生。',
      en: 'A greedy sprite that can constantly revive through its spirit form even if its physical body is destroyed.',
      ja: '強欲な精霊。肉体が滅んでも霊体を通じて再生し続ける。',
      ko: '탐욕스러운 정령입니다. 육신이 파괴되어도 영체를 통해 끊임없이 부활합니다.'
    },
    drops: [
      { itemId: 'item_material_essence', chance: 0.3, minQty: 1, maxQty: 1 }
    ]
  }
}

