export const demo_plains = {
    id: 'demo_plains',
    name: 'Demo Plains',
    width: 2000,
    height: 1200,
    constraints: {
        minYRatio: 0.35
    },

    // 入口定义
    entryPoints: {
        default: { x: 100, y: 400 },
        from_village: { x: 1950, y: 600 }, // 从右边来
        from_forest: { x: 1000, y: 100 }   // 从上边来
    },

    // 传送门定义
    portals: [
        {
            // 右侧边缘 -> 去村庄
            x: 1980, y: 0, w: 20, h: 1200,
            targetMapId: 'village',
            targetEntryId: 'from_demo'
        },
        {
            // 上方边缘 -> 去森林
            x: 0, y: 0, w: 2000, h: 20,
            targetMapId: 'forest',
            targetEntryId: 'from_demo'
        }
    ],

    spawnPoint: { x: 100, y: 400 },
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
            x: 1800, 
            y: 500, 
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
        }
    ],
    obstacles: [
        {
            x: 300, y: 200, radius: 40, shape: 'circle'
        },
        {
            x: 100, y: 100, width: 60, height: 20, shape: 'aabb'
        },
        {
            x: 1200, y: 700, width: 200, height: 50, rotation: 0.2, shape: 'obb'
        },
        {
            x: 800, y: 1000, radius: 20, width: 60, height: 20, shape: 'capsule'
        }
    ],
    spawners: [
        {
            enemyIds: ['character_wasteland_wolf'],
            count: 3,
            area: { x: 400, y: 400, w: 1000, h: 600 },
            options: { aiType: 'chase', visionRadius: 200, speed: 110, scale: 0.8 }
        },
        {
            enemyIds: ['character_slime'],
            count: 5,
            area: { x: 100, y: 600, w: 1800, h: 500 },
            options: { aiType: 'wander', visionRadius: 100, speed: 60, scale: 0.8 }
        }
    ],
    npcs: [
        {
            x: 200, y: 350,
            dialogueId: 'welcome',
            name: 'Guide',
            spriteId: 'npc_guide',
            sx: 0, sy: 0,
            scale: 0.8 // NPC大小
        },
        {
            x: 500, y: 300,
            dialogueId: 'elder_greeting',
            name: 'Elder',
            spriteId: 'npc_elder',
            sx: 0, sy: 0,
            scale: 0.8
        }
    ]
}
