// 资源清单注册表
// 格式: key: '资源路径' (相对于 public 目录)

export const AssetManifest = {
  // Characters
  'player_sprite': '/assets/characters/player.png', // 暂时用svg冒充png方便测试
  'npc_guide': '/assets/characters/guide.png',
  'npc_elder': '/assets/characters/elder.png',

  // Enemies
  'enemy_slime': '/assets/characters/slime.png',
  // 缺省/Fallback
  'default_enemy': '/assets/characters/slime.png',

  // Maps (如果不需要背景图，可以不配，继续用纯色)
  // 'bg_demo': '/assets/maps/demo_bg.png' 
}

/**
 * 玩家外观配置
 */
export const PlayerConfig = {
  spriteId: 'player_sprite',
  scale: 0.7 // 调整玩家大小
}

/**
 * 获取资源路径
 * @param {string} id 资源ID
 * @returns {string} 资源完整路径
 */
export function getAssetPath(id) {
  const path = AssetManifest[id]
  if (!path) {
    // Return null so TextureStore can handle failure or fallback
    return null
  }
  return path
}

