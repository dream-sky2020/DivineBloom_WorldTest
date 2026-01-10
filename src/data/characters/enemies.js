export default {
  201: {
    id: 201,
    name: { zh: '史莱姆', 'zh-TW': '史萊姆', en: 'Slime', ja: 'スライム', ko: '슬라임' },
    role: "roles.monster",
    element: "elements.water",
    weaponType: "weapons.none",
    initialStats: { hp: 150, mp: 0, str: 10, def: 5, mag: 0, spd: 8 },
    skills: [2001, 401], // Slime Shot (Active) + Attack Up (Passive)
    spriteId: 'enemy_slime',
    description: { zh: '常见的胶状怪物。', en: 'A common gelatinous monster.' }
  },
  202: {
    id: 202,
    name: { zh: '吸血蝙蝠', 'zh-TW': '吸血蝙蝠', en: 'Vampire Bat', ja: '吸血コウモリ', ko: '흡혈 박쥐' },
    role: "roles.monster",
    element: "elements.wind",
    weaponType: "weapons.none",
    initialStats: { hp: 100, mp: 20, str: 12, def: 2, mag: 5, spd: 18 },
    skills: [2002], // Vampiric Bite
    spriteId: 'default',
    description: { zh: '行动敏捷的飞行怪物。', en: 'An agile flying monster.' }
  },
  203: {
    id: 203,
    name: { zh: '荒原狼', 'zh-TW': '荒原狼', en: 'Wasteland Wolf', ja: '荒野の狼', ko: '황무지 늑대' },
    role: "roles.monster",
    element: "elements.earth",
    weaponType: "weapons.claw",
    initialStats: { hp: 300, mp: 0, str: 20, def: 8, mag: 0, spd: 14 },
    skills: [2003, 401], // Pack Bite + Attack Up
    spriteId: 'default',
    description: { zh: '凶猛的群居野兽。', en: 'A ferocious pack beast.' }
  },
  204: {
    id: 204,
    name: { zh: '重装守卫', 'zh-TW': '重裝守衛', en: 'Heavy Guard', ja: 'ヘビーガード', ko: '헤비 가드' },
    role: "roles.monster",
    element: "elements.metal",
    weaponType: "weapons.shield",
    initialStats: { hp: 500, mp: 50, str: 25, def: 20, mag: 0, spd: 6 },
    skills: [2004, 302], // Shield Bash + Shield (Buff)
    spriteId: 'default',
    description: { zh: '全副武装的巡逻者。', en: 'A fully armed patroller.' }
  }
}

