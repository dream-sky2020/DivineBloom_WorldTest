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
        groundColor: '#bbf7d0',
        decorations: [
            { type: 'rect', x: 80, yRatio: 0.55, width: 140, height: 18, color: 'rgba(0,0,0,0.10)' },
            { type: 'rect', x: 260, yRatio: 0.70, width: 200, height: 18, color: 'rgba(0,0,0,0.10)' }
        ]
    },
    spawners: [
        {
            enemyIds: [203],
            count: 1,
            area: { x: 300, y: 300, w: 400, h: 300 },
            options: { aiType: 'chase', visionRadius: 200, speed: 110, scale: 0.8 }
        },
        {
            enemyIds: [201],
            count: 2,
            area: { x: 100, y: 400, w: 300, h: 200 },
            options: { aiType: 'wander', visionRadius: 100, speed: 60, scale: 0.8 }
        },
        {
            enemyIds: [204],
            count: 1,
            area: { x: 300, y: 300, w: 500, h: 300 },
            options: { aiType: 'chase', visionType: 'hybrid', visionAngle: 75, visionRadius: 250, speed: 90, suspicionTime: 1.5, scale: 0.9 }
        },
        {
            enemyIds: [204, 203, 203, 202],
            count: 1,
            area: { x: 500, y: 300, w: 200, h: 200 },
            options: { aiType: 'chase', visionType: 'cone', visionAngle: 60, visionRadius: 300, speed: 70, suspicionTime: 2.0, scale: 0.8 }
        },
        {
            enemyIds: [201, 201],
            count: 2,
            area: { x: 100, y: 500, w: 200, h: 200 },
            options: { aiType: 'flee', visionRadius: 180, speed: 100, suspicionTime: 1.0, scale: 0.8 }
        },
        {
            enemyIds: [202, 202],
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
