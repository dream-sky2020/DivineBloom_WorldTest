export const village = {
    id: 'village',
    name: 'Peaceful Village',
    width: 800,
    height: 600,

    constraints: {
        minYRatio: 0.35
    },

    // 入口定义 - 只用于跨地图传送的入口点
    entryPoints: {
        default: { x: 100, y: 400 },     // 默认出生点
        from_demo: { x: 100, y: 400 },   // 从demo_plains进入时的落点
        from_forest: { x: 700, y: 400 }  // 从森林进入时的落点
    },

    // 传送门定义
    portals: [
        {
            // 跨地图传送：左侧边缘 -> 回 demo_plains
            x: 0, y: 0, w: 20, h: 600,
            targetMapId: 'demo_plains',
            targetEntryId: 'from_village'
        },
        {
            // 跨地图传送：右侧边缘 -> 去森林
            x: 780, y: 0, w: 20, h: 600,
            targetMapId: 'forest',
            targetEntryId: 'from_village'
        }
    ],

    background: {
        groundColor: '#dcfce7' // 较浅的草地
    },
    decorations: [
        { type: 'sprite', spriteId: 'door_2', x: 100, yRatio: 0.4, scale: 1.0 },
        { type: 'sprite', spriteId: 'table_4', x: 300, yRatio: 0.5, scale: 0.8 },
        { type: 'sprite', spriteId: 'table_0', x: 600, yRatio: 0.6, scale: 0.8 }
    ],

    npcs: [
        {
            x: 400, y: 300,
            spriteId: 'npc_elder',
            dialogueId: 'elderDialogue', // Update ID to match exported function name in elder.js
            range: 60
        }
    ],

    spawners: [
        {
            // 村庄里只有一些温和的史莱姆
            enemyIds: ['character_slime'],
            count: 3,
            area: { x: 200, y: 400, w: 400, h: 200 },
            options: { aiType: 'wander', visionRadius: 80, speed: 40, scale: 0.6 }
        }
    ]
}
