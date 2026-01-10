// 视觉资源定义
// 这里定义了游戏中所有的“外观”
// 逻辑层（Entity）只需要引用 key (如 'hero', 'slime')，不需要关心具体是用哪张图、怎么切

import { AssetManifest } from './assets'

export const Visuals = {
    // --- 玩家 ---
    'hero': {
        assetId: 'player_sprite', // 对应 assets.js 中的 key
        // 布局定义：单张图还是网格图集？
        // 目前你的资源是单张图，我们视为 1x1 的图集
        layout: {
            type: 'grid', // 'grid' | 'rects'
            width: 0,     // 0 表示使用图片原始宽度
            height: 0,    // 0 表示使用图片原始高度
            cols: 1,
            rows: 1,
        },
        // 锚点 (0.5, 1.0 表示脚底中心)
        anchor: { x: 0.5, y: 1.0 },
        // 动画定义
        animations: {
            // 即使是静态图，也定义为 1 帧的动画，方便逻辑统一
            'idle': { frames: [0], speed: 0, loop: false },
            'walk': { frames: [0], speed: 8, loop: true }, // 未来有了图集，改成 [0, 1, 2, 3] 即可
            'attack': { frames: [0], speed: 12, loop: false }
        }
    },

    // --- NPCs ---
    'npc_guide': {
        assetId: 'npc_guide',
        layout: { type: 'grid', cols: 1, rows: 1 },
        anchor: { x: 0.5, y: 1.0 },
        animations: {
            'default': { frames: [0] }
        }
    },
    'npc_elder': {
        assetId: 'npc_elder',
        layout: { type: 'grid', cols: 1, rows: 1 },
        anchor: { x: 0.5, y: 1.0 },
        animations: {
            'default': { frames: [0] }
        }
    },

    // --- 敌人 ---
    'enemy_slime': {
        assetId: 'enemy_slime',
        layout: { type: 'grid', cols: 1, rows: 1 },
        anchor: { x: 0.5, y: 1.0 },
        animations: {
            // 模拟一个简单的“呼吸”效果，虽然只有一帧，但我们可以通过 RenderSystem 的 scale 参数做特效
            // 或者如果有两张图，就在这里配置
            'idle': { frames: [0], speed: 0 },
            'move': { frames: [0], speed: 0 },
            'attack': { frames: [0], speed: 0 },
            'stunned': { frames: [0], speed: 0 }
        }
    },

    // --- Portals ---
    'portal_default': {
        assetId: 'default_enemy', // Temporary placeholder
        layout: { type: 'grid', cols: 1, rows: 1 },
        anchor: { x: 0.5, y: 1.0 },
        animations: { 'default': { frames: [0] } }
    },

    // 缺省/调试用
    'default': {
        assetId: 'default_enemy', // 假设 assets.js 有这个
        layout: { type: 'grid', cols: 1, rows: 1 },
        anchor: { x: 0.5, y: 1.0 },
        animations: { 'default': { frames: [0] } }
    }
}

/**
 * 获取视觉定义
 * @param {string} id 
 */
export function getVisualDef(id) {
    return Visuals[id] || Visuals['default']
}

