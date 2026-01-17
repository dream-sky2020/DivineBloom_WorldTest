// src/utils/iconMap.js

// 图标映射表
// 键名使用 snake_case 格式：icon_xxx
// 目前映射到 emoji，未来可以映射到图片路径 (e.g., '/images/icons/potion.png')
export const iconMap = {
  // Consumables
  icon_potion: "🧪",
  icon_herb: "🌱",
  icon_tent: "⛺",
  icon_feather: "🪶",
  icon_feather_all: "🪶", // Mass Revive Item
  icon_potion_splash: "🧪", // Splashing Potion
  icon_bomb: "💣",
  icon_bomb_ice: "🧊",

  // Weapons
  icon_sword: "⚔️",
  icon_dagger: "🗡️",
  icon_staff: "🦯",
  icon_sniper: "🎯",
  icon_machinegun: "🔫",
  icon_pistol: "🔫",
  icon_shotgun: "💥",
  icon_smg: "🔫",

  // Ammo
  icon_ammo: "💊",
  icon_ammo_speed: "⏩",
  icon_ammo_fire: "🔥",
  icon_ammo_curse: "☠️",
  icon_ammo_bomb: "💣",
  icon_ammo_homing: "🎯",
  icon_ammo_pierce: "🔩",
  icon_ammo_acid: "🧪",
  icon_ammo_magic: "✨",
  icon_ammo_holy: "🌟",

  // Armor
  icon_armor: "👕", // Leather Armor
  icon_shield: "🛡️",
  icon_robe: "👘",

  // Accessories
  icon_ring: "💍",

  // Key Items
  icon_map: "🗺️",
  icon_key: "🗝️",

  // Materials
  icon_material_gel: "💧",
  icon_material_fang: "🦷",
  icon_material_pelt: "📜",
  icon_material_metal: "🔩",
  icon_material_shard: "💎",
  icon_material_dust: "✨",
  icon_material_crystal: "🔮",
  icon_material_essence: "🏺",

  // Skills
  icon_slash: "⚔️", // 可以复用 icon_sword，但区分语意更好
  icon_impact: "💥",
  icon_fire: "🔥",
  icon_fire_rain: "☄️",
  icon_ice: "❄️",
  icon_lightning: "⚡",
  icon_heal: "💚",
  icon_heal_all: "💖", // Mass Heal
  icon_revive: "✨",
  icon_revive_all: "🌟", // Mass Revive Skill
  icon_strength: "🦾",
  icon_mana: "💧",
  icon_heart_pulse: "💓",
  icon_skull: "💀",
  icon_plague_rain: "🌧️",
  icon_spike_explosion: "🌵",
  icon_forward_allies: "🎺",
  icon_hell_revival: "👿",
  icon_phoenix: "🐦",

  // Firearm Skills
  icon_skill_shoot: "🔫",
  icon_skill_reload: "🔄",
  icon_skill_magic_ammo: "🔮",
  icon_skill_shoot_speed: "🔫", // Quick Shot
  icon_skill_reload_speed: "🔄", // Quick Reload

  // Monster Skills
  icon_slime: "🦠",
  icon_fang: "🦷",
  icon_claw: "🐾",
  icon_shield_bash: "💥",

  // Status Effects
  icon_poison: "☠️",
  icon_freeze: "🧊",
  icon_bleed: "🩸",
  icon_slow: "🐢",
  icon_haste: "⏩",
  icon_regen: "✨", // 复用星星
  icon_buff_atk: "⚔️",
  icon_buff_def: "🛡️",
  icon_limit_break: "🔥", // 限界突破/破碎监牢
  icon_warning: "⚠️",
  icon_death: "💀",

  // Characters
  icon_user: "👤",

  // UI / Fallbacks
  icon_box: "📦",
  icon_unknown: "?",
  icon_locked: "🔒",

  // Battle UI
  icon_backpack: "🎒",
  icon_switch: "🔄",
  icon_skip: "⏭️",
  icon_flower: "🌸",
  icon_magic: "✨",
  icon_run: "🏃",
  icon_bp_plus: "➕",
  icon_bp_minus: "➖",
  icon_bp_cancel: "✖️"
};

/**
 * 获取图标内容
 * @param {string} key - 图标的键名 (e.g., 'icon_potion')
 * @returns {string} - 对应的 emoji 或 原始 key (如果未找到)
 */
export const getIcon = (key) => {
  return iconMap[key] || key;
};

/**
 * 检查是否为图片路径 (未来使用)
 * @param {string} key 
 * @returns {boolean}
 */
export const isImageIcon = (key) => {
  // 简单的检查逻辑，未来根据实际图片路径规则调整
  return typeof key === 'string' && (key.startsWith('/') || key.startsWith('http') || key.endsWith('.png') || key.endsWith('.gif'));
};
