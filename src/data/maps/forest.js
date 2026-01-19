export const forest = {
    id: 'forest',
    name: 'Dark Forest',
    width: 800,
    height: 600,

    constraints: {
        minYRatio: 0.35
    },

    // 入口定义 - 只用于跨地图传送的入口点
    entryPoints: {
        default: { x: 100, y: 400 },      // 默认出生点
        from_village: { x: 100, y: 400 }, // 从村庄进入时的落点
        from_demo: { x: 400, y: 450 }     // 从demo_plains进入时的落点
    },

    // 传送门定义
    portals: [
        {
            // 跨地图传送：左侧边缘 -> 回村庄 (强制)
            x: 0, y: 300, w: 20, h: 200,
            isForced: true,
            targetMapId: 'village',
            targetEntryId: 'from_forest'
        },
        {
            // 跨地图传送：左侧入口 -> 回村庄 (非强制)
            x: 80, y: 380, w: 60, h: 60,
            isForced: false,
            targetMapId: 'village',
            targetEntryId: 'from_forest'
        },
        {
            // 跨地图传送：下方边缘 -> 去 demo_plains (强制)
            x: 300, y: 580, w: 200, h: 20,
            isForced: true,
            targetMapId: 'demo_plains',
            targetEntryId: 'from_forest'
        },
        {
            // 跨地图传送：下方中心 -> 去 demo_plains (非强制)
            x: 370, y: 500, w: 60, h: 60,
            isForced: false,
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
            options: { 
                aiType: 'chase', 
                visionType: 'cone', 
                visionAngle: 60, 
                visionRadius: 250, 
                speed: 80, 
                scale: 0.9,
                stunDuration: 8,
                chaseExitMultiplier: 2.0
            }
        }
    ]
}
