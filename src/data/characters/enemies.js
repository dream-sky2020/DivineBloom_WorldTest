export default {
  'character_slime': {
    id: 'character_slime',
    name: { zh: '史莱姆', 'zh-TW': '史萊姆', en: 'Slime', ja: 'スライム', ko: '슬라임' },
    role: "roles.monster",
    element: "elements.water",
    weaponType: "weapons.none",
    initialStats: { hp: 150, mp: 0, str: 10, def: 5, mag: 0, spd: 8 },
    skills: ['skill_enemy_slime_shot', 'skill_passive_attack_up', 'skill_passive_call_of_death'], // Slime Shot (Active) + Attack Up (Passive)
    spriteId: 'enemy_slime',
    description: { zh: '常见的胶状怪物。', en: 'A common gelatinous monster.' },
    drops: [
      { itemId: 'item_material_slime_gel', chance: 0.8, minQty: 1, maxQty: 2 }, // Slime Gel
      { itemId: 'item_consumable_potion', chance: 0.1, minQty: 1, maxQty: 1 }     // Potion (example)
    ]
  },
  'character_vampire_bat': {
    id: 'character_vampire_bat',
    name: { zh: '吸血蝙蝠', 'zh-TW': '吸血蝙蝠', en: 'Vampire Bat', ja: '吸血コウモリ', ko: '흡혈 박쥐' },
    role: "roles.monster",
    element: "elements.wind",
    weaponType: "weapons.none",
    initialStats: { hp: 100, mp: 20, str: 12, def: 2, mag: 5, spd: 18 },
    skills: ['skill_enemy_vampiric_bite', 'skill_passive_call_of_death'], // Vampiric Bite
    spriteId: 'default',
    description: { zh: '行动敏捷的飞行怪物。', en: 'An agile flying monster.' },
    drops: [
      { itemId: 'item_material_bat_fang', chance: 0.6, minQty: 1, maxQty: 1 } // Bat Fang
    ]
  },
  'character_wasteland_wolf': {
    id: 'character_wasteland_wolf',
    name: { zh: '荒原狼', 'zh-TW': '荒原狼', en: 'Wasteland Wolf', ja: '荒野の狼', ko: '황무지 늑대' },
    role: "roles.monster",
    element: "elements.earth",
    weaponType: "weapons.claw",
    initialStats: { hp: 300, mp: 0, str: 20, def: 8, mag: 0, spd: 14 },
    skills: ['skill_enemy_pack_bite', 'skill_passive_attack_up', 'skill_passive_call_of_death'], // Pack Bite + Attack Up
    spriteId: 'default',
    description: { zh: '凶猛的群居野兽。', en: 'A ferocious pack beast.' },
    drops: [
      { itemId: 'item_material_wolf_pelt', chance: 0.5, minQty: 1, maxQty: 1 }, // Wolf Pelt
      { itemId: 'item_material_bat_fang', chance: 0.2, minQty: 1, maxQty: 1 }  // Bat Fang (maybe they ate a bat?) - Just example
    ]
  },
  'character_heavy_guard': {
    id: 'character_heavy_guard',
    name: { zh: '重装守卫', 'zh-TW': '重裝守衛', en: 'Heavy Guard', ja: 'ヘビーガード', ko: '헤비 가드' },
    role: "roles.monster",
    element: "elements.metal",
    weaponType: "weapons.shield",
    initialStats: { hp: 500, mp: 50, str: 25, def: 20, mag: 0, spd: 6 },
    skills: ['skill_enemy_shield_bash', 'skill_support_shield', 'skill_passive_call_of_death'], // Shield Bash + Shield (Buff)
    spriteId: 'default',
    description: { zh: '全副武装的巡逻者。', en: 'A fully armed patroller.' },
    drops: [
      { itemId: 'item_material_iron_scrap', chance: 0.7, minQty: 1, maxQty: 3 }, // Iron Scrap
      { itemId: 'item_consumable_elixir', chance: 0.1, minQty: 1, maxQty: 1 }     // Elixir
    ]
  }
}

