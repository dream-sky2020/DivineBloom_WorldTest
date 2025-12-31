// src/data/characters.js

/**
 * 角色数据库 (Characters)
 * 记录角色初始状态和基本信息
 */
export const charactersDb = {
  1: {
    id: 1,
    name: "characters.1.name",
    role: "roles.swordsman",
    element: "elements.fire",
    weaponType: "weapons.sword",
    initialStats: {
      hp: 500,
      mp: 50,
      str: 18,
      def: 12,
      mag: 8,
      spd: 10
    },
    description: "characters.1.description"
  },
  2: {
    id: 2,
    name: "characters.2.name",
    role: "roles.gunner",
    element: "elements.fire", // Also uses astral energy
    weaponType: "weapons.rifle",
    initialStats: {
      hp: 380,
      mp: 120,
      str: 14,
      def: 10,
      mag: 20,
      spd: 14
    },
    description: "characters.2.description"
  },
  3: {
    id: 3,
    name: "characters.3.name",
    role: "roles.mage",
    element: "elements.windLight",
    weaponType: "weapons.book",
    initialStats: {
      hp: 300,
      mp: 200,
      str: 6,
      def: 8,
      mag: 25,
      spd: 12
    },
    description: "characters.3.description"
  },
  4: {
    id: 4,
    name: "characters.4.name",
    role: "roles.brawler",
    element: "elements.light",
    weaponType: "weapons.gauntlets",
    initialStats: {
      hp: 550,
      mp: 60,
      str: 22,
      def: 10,
      mag: 5,
      spd: 18
    },
    description: "characters.4.description"
  }
};
