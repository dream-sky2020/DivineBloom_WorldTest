export const village = {
    id: 'village',
    name: 'Peaceful Village',
    
    constraints: {
        minYRatio: 0.35
    },

    entryPoints: {
        default: { x: 100, y: 400 },
        from_demo: { x: 50, y: 400 },   // 从左边（Demo）来，出现在左侧
        from_forest: { x: 750, y: 400 } // 从右边（森林）来，出现在右侧
    },

    portals: [
        {
            // 左侧边缘 -> 回 Demo
            x: 0, y: 0, w: 20, h: 600, 
            targetMapId: 'demo_plains',
            targetEntryId: 'from_village'
        },
        {
            // 右侧边缘 -> 去森林
            x: 780, y: 0, w: 20, h: 600, 
            targetMapId: 'forest',
            targetEntryId: 'from_village'
        }
    ],

    background: {
        groundColor: '#dcfce7', // 较浅的草地
        decorations: [
            { type: 'rect', x: 50, yRatio: 0.30, width: 60, height: 60, color: '#94a3b8' }, // 房子示意
            { type: 'rect', x: 150, yRatio: 0.32, width: 50, height: 50, color: '#94a3b8' }, // 房子示意
            { type: 'rect', x: 300, yRatio: 0.70, width: 200, height: 20, color: '#a8a29e' } // 道路
        ]
    },

    spawners: [
        {
            // 村庄里只有一些温和的史莱姆
            enemyIds: [201],
            count: 3,
            area: { x: 200, y: 400, w: 400, h: 200 },
            options: { aiType: 'wander', visionRadius: 80, speed: 40 }
        }
    ]
}
