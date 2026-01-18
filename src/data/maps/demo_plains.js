export const demo_plains = {
    id: 'demo_plains',
    name: 'Demo Plains',
    constraints: {
        minYRatio: 0.35
    },

    // 入口定义
    entryPoints: {
        default: { x: 100, y: 400 },
        from_village: { x: 750, y: 400 }, // 从右边（村庄）回来，出现在右侧
        from_forest: { x: 400, y: 250 }   // 从上边（森林）回来，出现在上方
    },

    // 传送门定义
    portals: [
        {
            // 右侧边缘 -> 去村庄
            x: 780, y: 0, w: 20, h: 600,
            targetMapId: 'village',
            targetEntryId: 'from_demo'
        },
        {
            // 上方边缘 -> 去森林
            x: 0, y: 600, w: 400, h: 20, // 假设屏幕宽度800，高度600
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
            x: 500, 
            yRatio: 0.7, 
            scale: 0.8,
            // 自定义圆形碰撞体
            collider: { type: 'circle', radius: 30, offsetY: 10 }
        },
        { 
            type: 'sprite', 
            spriteId: 'door_0', 
            x: 700, 
            yRatio: 0.4, 
            scale: 1.0,
            // 无碰撞体（即使是默认可能有的情况，这里显式指定一个空的或者不传，DecorationEntity 现在只在 rect 时默认加）
        },
        {
            type: 'rect',
            x: 150,
            y: 500,
            width: 40,
            height: 40,
            color: 'blue',
            // 覆盖默认 AABB，改为 OBB
            collider: { type: 'obb', width: 40, height: 40, rotation: Math.PI / 4 }
        }
    ],
    obstacles: [
        {
            // 圆形空气墙
            x: 300, y: 200, radius: 40, shape: 'circle'
        },
        {
            // 矩形空气墙 (AABB)
            x: 100, y: 100, width: 60, height: 20, shape: 'aabb'
        },
        {
            // 旋转矩形空气墙 (OBB)
            x: 400, y: 150, width: 80, height: 30, rotation: 0.5, shape: 'obb'
        },
        {
            // 胶囊体空气墙
            x: 600, y: 500, radius: 20, width: 60, height: 20, shape: 'capsule'
        },
        {
            // 长长的旋转胶囊体
            x: 400, y: 400, 
            radius: 25, 
            p1: { x: -100, y: 0 }, 
            p2: { x: 100, y: 0 }, 
            rotation: Math.PI / 6, // 旋转 30 度
            shape: 'capsule'
        }
    ],
    spawners: [
        {
            enemyIds: ['character_wasteland_wolf'],
            count: 1,
            area: { x: 300, y: 300, w: 400, h: 300 },
            options: { aiType: 'chase', visionRadius: 200, speed: 110, scale: 0.8 }
        },
        {
            enemyIds: ['character_slime'],
            count: 2,
            area: { x: 100, y: 400, w: 300, h: 200 },
            options: { aiType: 'wander', visionRadius: 100, speed: 60, scale: 0.8 }
        },
        {
            enemyIds: ['character_heavy_guard'],
            count: 1,
            area: { x: 300, y: 300, w: 500, h: 300 },
            options: { aiType: 'chase', visionType: 'hybrid', visionAngle: 75, visionRadius: 250, speed: 90, suspicionTime: 1.5, scale: 0.9 }
        },
        {
            enemyIds: ['character_heavy_guard', 'character_wasteland_wolf', 'character_wasteland_wolf', 'character_vampire_bat'],
            count: 1,
            area: { x: 500, y: 300, w: 200, h: 200 },
            options: { aiType: 'chase', visionType: 'cone', visionAngle: 60, visionRadius: 300, speed: 70, suspicionTime: 2.0, scale: 0.8 }
        },
        {
            enemyIds: ['character_slime', 'character_slime'],
            count: 2,
            area: { x: 100, y: 500, w: 200, h: 200 },
            options: { aiType: 'flee', visionRadius: 180, speed: 100, suspicionTime: 1.0, scale: 0.8 }
        },
        {
            enemyIds: ['character_vampire_bat', 'character_vampire_bat'],
            count: 2,
            area: { x: 600, y: 100, w: 200, h: 200 },
            options: { aiType: 'flee', visionType: 'cone', visionAngle: 120, visionRadius: 220, speed: 140, suspicionTime: 2.5, scale: 0.8 }
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
