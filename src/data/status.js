// src/data/status.js

/**
 * 状态效果数据库 (Buffs/Debuffs)
 * ID 规则:
 * 1-99: 异常状态 (Debuffs)
 * 100-199: 增益状态 (Buffs)
 */
export const statusDb = {
  // Debuffs
  1: {
    id: 1,
    name: "status.1.name",
    type: "statusTypes.debuff",
    icon: "☠️",
    subText: "status.1.subText",
    description: "status.1.description"
  },
  2: {
    id: 2,
    name: "status.2.name",
    type: "statusTypes.debuff",
    icon: "🔥",
    subText: "status.2.subText",
    description: "status.2.description"
  },
  3: {
    id: 3,
    name: "status.3.name",
    type: "statusTypes.debuff",
    icon: "🧊",
    subText: "status.3.subText",
    description: "status.3.description"
  },
  4: {
    id: 4,
    name: "status.4.name",
    type: "statusTypes.debuff",
    icon: "⚡",
    subText: "status.4.subText",
    description: "status.4.description"
  },

  // Buffs
  101: {
    id: 101,
    name: "status.101.name",
    type: "statusTypes.buff",
    icon: "✨",
    subText: "status.101.subText",
    description: "status.101.description"
  },
  102: {
    id: 102,
    name: "status.102.name",
    type: "statusTypes.buff",
    icon: "⚔️",
    subText: "status.102.subText",
    description: "status.102.description"
  },
  103: {
    id: 103,
    name: "status.103.name",
    type: "statusTypes.buff",
    icon: "⏩",
    subText: "status.103.subText",
    description: "status.103.description"
  }
};
