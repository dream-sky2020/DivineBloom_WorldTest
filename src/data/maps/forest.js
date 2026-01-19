export const forest = {
    id: 'forest',
    name: 'Dark Forest',
    width: 800,
    height: 600,

    constraints: {
        minYRatio: 0.35
    },

    entryPoints: {
        default: { x: 100, y: 400 },
        from_village: { x: 50, y: 400 }, // 从左边（村庄）来，出现在左侧
        from_demo: { x: 400, y: 480 }    // 从下边（Demo）来，出现在下方 (远离底部 Portal 防止误触)
    },

    portals: [
        {
            // 左侧边缘 -> 回村庄
            x: 0, y: 0, w: 20, h: 600,
            targetMapId: 'village',
            targetEntryId: 'from_forest'
        },
        {
            // 下方边缘 -> 去 Demo
            x: 0, y: 580, w: 800, h: 20,
            targetMapId: 'demo_plains',
            targetEntryId: 'from_forest'
        }
    ],

    background: {
        groundColor: '#14532d' // 深绿色草地
    },
    decorations: [
        { type: 'sprite', spriteId: 'door_1', x: 400, yRatio: 0.35, scale: 1.0 },
        { type: 'sprite', spriteId: 'table_2', x: 200, yRatio: 0.6, scale: 0.8 },
        { type: 'sprite', spriteId: 'table_3', x: 600, yRatio: 0.5, scale: 0.8 }
    ],

    spawners: [
        {
            // 森林里有狼和卫兵
            enemyIds: ['character_wasteland_wolf'],
            count: 2,
            area: { x: 300, y: 300, w: 400, h: 300 },
            options: { aiType: 'chase', visionRadius: 200, speed: 100, scale: 0.8 }
        },
        {
            enemyIds: ['character_heavy_guard'],
            count: 1,
            area: { x: 500, y: 300, w: 200, h: 200 },
            options: { aiType: 'chase', visionType: 'cone', visionAngle: 60, visionRadius: 250, speed: 80, scale: 0.9 }
        }
    ]
}
