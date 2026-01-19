export const demo_plains = {
    id: 'demo_plains',
    name: 'Demo Plains',
    width: 3200,
    height: 2400,
    constraints: {
        minYRatio: 0 // 移除限制，允许探索全图
    },

    // 入口定义 - 只用于跨地图传送的入口点
    entryPoints: {
        default: { x: 200, y: 1200 },        // 默认出生点
        from_village: { x: 3000, y: 1200 },  // 从村庄进入时的落点
        from_forest: { x: 1600, y: 200 }     // 从森林进入时的落点
    },

    // 传送门目的地定义
    portalDestinations: [
        { id: 'north_ruins', x: 2800, y: 400, name: '北部遗迹' },
        { id: 'south_lake', x: 600, y: 2000, name: '南部湖泊' },
        { id: 'center_altar', x: 1600, y: 1200, name: '中心祭坛' },
        { id: 'spawn_point', x: 200, y: 1200, name: '出生点' }
    ],

    // 传送门定义
    portals: [
        {
            // 同地图传送：从出生点附近传送到北部遗迹
            x: 500, y: 1100, w: 60, h: 60,
            destinationId: 'north_ruins'
        },
        {
            // 同地图传送：从北部遗迹传送到南部湖泊 (跨度很大)
            x: 2700, y: 500, w: 80, h: 80,
            destinationId: 'south_lake'
        },
        {
            // 同地图传送：从南部湖泊传送到中心祭坛
            x: 800, y: 2100, w: 60, h: 60,
            destinationId: 'center_altar'
        },
        {
            // 同地图传送：中心祭坛传回出生点 (形成循环)
            x: 1600, y: 1300, w: 60, h: 60,
            destinationId: 'spawn_point'
        },
        {
            // 跨地图传送：右侧边缘 -> 去村庄
            x: 3180, y: 0, w: 20, h: 2400,
            targetMapId: 'village',
            targetEntryId: 'from_demo'
        },
        {
            // 跨地图传送：上方边缘 -> 去森林
            x: 0, y: 0, w: 3200, h: 20,
            targetMapId: 'forest',
            targetEntryId: 'from_demo'
        }
    ],

    spawnPoint: { x: 200, y: 1200 },
    background: {
        groundColor: '#bbf7d0'
    },
    decorations: [
        { type: 'sprite', spriteId: 'table_0', x: 200, yRatio: 0.6, scale: 0.8 },
        { 
            type: 'sprite', 
            spriteId: 'table_1', 
            x: 1500, 
            y: 800, 
            scale: 0.8,
            // 自定义圆形碰撞体
            collider: { type: 'circle', radius: 30, offsetY: 10 }
        },
        { 
            type: 'sprite', 
            spriteId: 'door_0', 
            x: 3000, 
            y: 1100, 
            scale: 1.0,
        },
        {
            type: 'rect',
            x: 500,
            y: 900,
            width: 40,
            height: 40,
            color: 'blue',
            collider: { type: 'obb', width: 40, height: 40, rotation: Math.PI / 4 }
        },
        // 新增扩展区域装饰
        { type: 'sprite', spriteId: 'table_0', x: 2800, y: 450, scale: 1.2 },
        { type: 'rect', x: 1600, y: 1200, width: 100, height: 100, color: 'gold', collider: { type: 'aabb', width: 100, height: 100 } }
    ],
    obstacles: [
        { x: 300, y: 200, radius: 40, shape: 'circle' },
        { x: 100, y: 100, width: 60, height: 20, shape: 'aabb' },
        { x: 1200, y: 700, width: 200, height: 50, rotation: 0.2, shape: 'obb' },
        { x: 800, y: 1000, radius: 20, width: 60, height: 20, shape: 'capsule' },
        // 扩展区域障碍
        { x: 2000, y: 1500, width: 400, height: 100, rotation: -0.5, shape: 'obb' },
        { x: 500, y: 1800, radius: 100, shape: 'circle' }
    ],
    spawners: [
        {
            enemyIds: ['character_wasteland_wolf'],
            count: 3,
            area: { x: 400, y: 1000, w: 1000, h: 600 },
            options: { aiType: 'chase', visionRadius: 300, speed: 110, scale: 0.8 }
        },
        {
            enemyIds: ['character_slime'],
            count: 8,
            area: { x: 100, y: 600, w: 3000, h: 1500 },
            options: { aiType: 'wander', visionRadius: 150, speed: 60, scale: 0.8 }
        },
        // 北部遗迹的强力狼群
        {
            enemyIds: ['character_wasteland_wolf'],
            count: 5,
            area: { x: 2400, y: 300, w: 600, h: 400 },
            options: { aiType: 'chase', visionRadius: 400, speed: 130, scale: 1.0 }
        }
    ],
    npcs: [
        {
            x: 400, y: 1150,
            dialogueId: 'welcome',
            name: 'Guide',
            spriteId: 'npc_guide',
            sx: 0, sy: 0,
            scale: 0.8
        },
        {
            x: 600, y: 1100,
            dialogueId: 'elder_greeting',
            name: 'Elder',
            spriteId: 'npc_elder',
            sx: 0, sy: 0,
            scale: 0.8
        }
    ]
}
