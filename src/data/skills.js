// src/data/skills.js

/**
 * 技能数据库
 * ID 规则:
 * 100-199: 物理攻击技能 (Physical)
 * 200-299: 魔法攻击技能 (Magic)
 * 300-399: 治疗/辅助技能 (Support)
 * 400-499: 被动技能 (Passive)
 */
export const skillsDb = {
  // Physical Skills
  101: {
    id: 101,
    name: "skills.101.name",
    type: "skillTypes.active",
    category: "skillCategories.physical",
    icon: "⚔️",
    cost: "5 MP",
    subText: "skills.101.subText",
    description: "skills.101.description"
  },
  102: {
    id: 102,
    name: "skills.102.name",
    type: "skillTypes.active",
    category: "skillCategories.physical",
    icon: "💥",
    cost: "15 MP",
    subText: "skills.102.subText",
    description: "skills.102.description"
  },

  // Magic Skills
  201: {
    id: 201,
    name: "skills.201.name",
    type: "skillTypes.active",
    category: "skillCategories.magic",
    element: "elements.fire",
    icon: "🔥",
    cost: "10 MP",
    subText: "skills.201.subText",
    description: "skills.201.description"
  },
  202: {
    id: 202,
    name: "skills.202.name",
    type: "skillTypes.active",
    category: "skillCategories.magic",
    element: "elements.ice",
    icon: "❄️",
    cost: "12 MP",
    subText: "skills.202.subText",
    description: "skills.202.description"
  },
  203: {
    id: 203,
    name: "skills.203.name",
    type: "skillTypes.active",
    category: "skillCategories.magic",
    element: "elements.lightning",
    icon: "⚡",
    cost: "25 MP",
    subText: "skills.203.subText",
    description: "skills.203.description"
  },

  // Support Skills
  301: {
    id: 301,
    name: "skills.301.name",
    type: "skillTypes.active",
    category: "skillCategories.support",
    icon: "💚",
    cost: "20 MP",
    subText: "skills.301.subText",
    description: "skills.301.description"
  },
  302: {
    id: 302,
    name: "skills.302.name",
    type: "skillTypes.active",
    category: "skillCategories.support",
    icon: "🛡️",
    cost: "30 MP",
    subText: "skills.302.subText",
    description: "skills.302.description"
  },

  // Passive Skills
  401: {
    id: 401,
    name: "skills.401.name",
    type: "skillTypes.passive",
    category: "skillCategories.passive",
    icon: "🦾",
    cost: "--",
    subText: "skills.401.subText",
    description: "skills.401.description"
  },
  402: {
    id: 402,
    name: "skills.402.name",
    type: "skillTypes.passive",
    category: "skillCategories.passive",
    icon: "💧",
    cost: "--",
    subText: "skills.402.subText",
    description: "skills.402.description"
  }
};
