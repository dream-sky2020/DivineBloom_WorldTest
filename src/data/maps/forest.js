export const forest = {
    id: 'forest',
    name: 'Dark Forest',

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
        groundColor: '#14532d', // 深绿色草地
        decorations: [
            { type: 'rect', x: 100, yRatio: 0.25, width: 20, height: 100, color: '#3f6212' }, // 树干
            { type: 'rect', x: 250, yRatio: 0.20, width: 30, height: 120, color: '#3f6212' },
            { type: 'rect', x: 600, yRatio: 0.28, width: 25, height: 90, color: '#3f6212' }
        ]
    },

    spawners: [
        {
            // 森林里有狼和卫兵
            enemyIds: [203],
            count: 2,
            area: { x: 300, y: 300, w: 400, h: 300 },
            options: { aiType: 'chase', visionRadius: 200, speed: 100, scale: 0.8 }
        },
        {
            enemyIds: [204],
            count: 1,
            area: { x: 500, y: 300, w: 200, h: 200 },
            options: { aiType: 'chase', visionType: 'cone', visionAngle: 60, visionRadius: 250, speed: 80, scale: 0.9 }
        }
    ]
}
