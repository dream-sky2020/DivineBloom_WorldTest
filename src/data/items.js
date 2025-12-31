// src/data/items.js

/**
 * 静态物品数据库
 * ID 规则: 
 * 1000-1999: 消耗品 (Consumables)
 * 2000-2999: 武器 (Weapons)
 * 3000-3999: 防具 (Armor)
 * 4000-4999: 饰品 (Accessories)
 * 9000-9999: 关键道具 (Key Items)
 */
export const itemsDb = {
  // Consumables (1000-1999)
  1001: {
    id: 1001,
    name: "items.1001.name",
    type: "itemTypes.consumable",
    icon: "🧪",
    subText: "items.1001.subText",
    footerLeft: "items.1001.footerLeft",
    description: "items.1001.description"
  },
  1002: {
    id: 1002,
    name: "items.1002.name",
    type: "itemTypes.consumable",
    icon: "🧪",
    subText: "items.1002.subText",
    footerLeft: "items.1002.footerLeft",
    description: "items.1002.description"
  },
  1003: {
    id: 1003,
    name: "items.1003.name",
    type: "itemTypes.consumable",
    icon: "🧪",
    subText: "items.1003.subText",
    footerLeft: "items.1003.footerLeft",
    description: "items.1003.description"
  },
  1004: {
    id: 1004,
    name: "items.1004.name",
    type: "itemTypes.consumable",
    icon: "🌱",
    subText: "items.1004.subText",
    footerLeft: "items.1004.footerLeft",
    description: "items.1004.description"
  },
  1005: {
    id: 1005,
    name: "items.1005.name",
    type: "itemTypes.consumable",
    icon: "⛺",
    subText: "items.1005.subText",
    footerLeft: "items.1005.footerLeft",
    description: "items.1005.description"
  },
  1006: {
    id: 1006,
    name: "items.1006.name",
    type: "itemTypes.consumable",
    icon: "🪶",
    subText: "items.1006.subText",
    footerLeft: "items.1006.footerLeft",
    description: "items.1006.description"
  },

  // Weapons (2000-2999)
  2001: {
    id: 2001,
    name: "items.2001.name",
    type: "itemTypes.weapon",
    icon: "⚔️",
    subText: "items.2001.subText",
    footerLeft: "items.2001.footerLeft",
    description: "items.2001.description"
  },
  2002: {
    id: 2002,
    name: "items.2002.name",
    type: "itemTypes.weapon",
    icon: "🗡️",
    subText: "items.2002.subText",
    footerLeft: "items.2002.footerLeft",
    description: "items.2002.description"
  },
  2003: {
    id: 2003,
    name: "items.2003.name",
    type: "itemTypes.weapon",
    icon: "🗡️",
    subText: "items.2003.subText",
    footerLeft: "items.2003.footerLeft",
    description: "items.2003.description"
  },
  2004: {
    id: 2004,
    name: "items.2004.name",
    type: "itemTypes.weapon",
    icon: "🦯",
    subText: "items.2004.subText",
    footerLeft: "items.2004.footerLeft",
    description: "items.2004.description"
  },

  // Armor (3000-3999)
  3001: {
    id: 3001,
    name: "items.3001.name",
    type: "itemTypes.armor",
    icon: "👕",
    subText: "items.3001.subText",
    footerLeft: "items.3001.footerLeft",
    description: "items.3001.description"
  },
  3002: {
    id: 3002,
    name: "items.3002.name",
    type: "itemTypes.armor",
    icon: "🛡️",
    subText: "items.3002.subText",
    footerLeft: "items.3002.footerLeft",
    description: "items.3002.description"
  },
  3003: {
    id: 3003,
    name: "items.3003.name",
    type: "itemTypes.armor",
    icon: "👘",
    subText: "items.3003.subText",
    footerLeft: "items.3003.footerLeft",
    description: "items.3003.description"
  },

  // Accessories (4000-4999)
  4001: {
    id: 4001,
    name: "items.4001.name",
    type: "itemTypes.accessory",
    icon: "💍",
    subText: "items.4001.subText",
    footerLeft: "items.4001.footerLeft",
    description: "items.4001.description"
  },
  4002: {
    id: 4002,
    name: "items.4002.name",
    type: "itemTypes.accessory",
    icon: "💍",
    subText: "items.4002.subText",
    footerLeft: "items.4002.footerLeft",
    description: "items.4002.description"
  },

  // Key Items (9000-9999)
  9001: {
    id: 9001,
    name: "items.9001.name",
    type: "itemTypes.keyItem",
    icon: "🗺️",
    subText: "items.9001.subText",
    footerLeft: "items.9001.footerLeft",
    description: "items.9001.description"
  },
  9002: {
    id: 9002,
    name: "items.9002.name",
    type: "itemTypes.keyItem",
    icon: "🗝️",
    subText: "items.9002.subText",
    footerLeft: "items.9002.footerLeft",
    description: "items.9002.description"
  }
};
